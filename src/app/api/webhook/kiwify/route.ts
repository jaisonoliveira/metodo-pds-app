import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Tipos de eventos do webhook da Kiwify
type KiwifyEventType = 
  | 'order.paid'
  | 'order.refunded'
  | 'order.chargeback'
  | 'subscription.started'
  | 'subscription.canceled'

interface KiwifyWebhookPayload {
  event: KiwifyEventType
  order_id: string
  order_ref: string
  customer: {
    email: string
    name: string
    phone?: string
  }
  product: {
    id: string
    name: string
  }
  subscription?: {
    id: string
    status: string
  }
  amount: number
  created_at: string
}

// Inicializar cliente Supabase com service role key
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    // Parse do body da requisição
    const payload: KiwifyWebhookPayload = await request.json()

    console.log('📥 Webhook Kiwify recebido:', {
      event: payload.event,
      order_id: payload.order_id,
      customer_email: payload.customer.email
    })

    // Processar evento baseado no tipo
    switch (payload.event) {
      case 'order.paid':
        await handleOrderPaid(payload)
        break
      
      case 'subscription.started':
        await handleSubscriptionStarted(payload)
        break
      
      case 'subscription.canceled':
        await handleSubscriptionCanceled(payload)
        break
      
      case 'order.refunded':
      case 'order.chargeback':
        await handleOrderRefundedOrChargeback(payload)
        break
      
      default:
        console.log('⚠️ Evento não tratado:', payload.event)
    }

    // Retornar sucesso para a Kiwify
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processado com sucesso' 
    }, { status: 200 })

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error)
    
    // Retornar erro mas com status 200 para não reenviar webhook
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao processar webhook' 
    }, { status: 200 })
  }
}

// Handler para pagamento aprovado
async function handleOrderPaid(payload: KiwifyWebhookPayload) {
  console.log('✅ Processando pagamento aprovado:', payload.order_id)

  try {
    const supabase = getSupabaseAdmin()

    // 1. Buscar usuário pelo email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('Erro ao buscar usuários:', userError)
      return
    }

    const user = userData.users.find(u => u.email === payload.customer.email)

    if (!user) {
      console.log('⚠️ Usuário não encontrado, criando registro de pagamento pendente')
      
      // Salvar pagamento para processar quando usuário se registrar
      await supabase.from('pending_payments').insert({
        email: payload.customer.email,
        order_id: payload.order_id,
        amount: payload.amount,
        product_name: payload.product.name,
        created_at: new Date().toISOString()
      })
      
      return
    }

    // 2. Atualizar status do usuário para PRO
    const { error: updateError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        email: payload.customer.email,
        is_pro: true,
        subscription_status: 'active',
        subscription_started_at: new Date().toISOString(),
        kiwify_order_id: payload.order_id,
        kiwify_subscription_id: payload.subscription?.id,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError)
      return
    }

    // 3. Registrar transação
    await supabase.from('transactions').insert({
      user_id: user.id,
      order_id: payload.order_id,
      event_type: payload.event,
      amount: payload.amount,
      customer_email: payload.customer.email,
      product_name: payload.product.name,
      status: 'completed',
      created_at: new Date().toISOString()
    })

    console.log('✅ Usuário atualizado para PRO:', user.email)

  } catch (error) {
    console.error('Erro em handleOrderPaid:', error)
  }
}

// Handler para assinatura iniciada
async function handleSubscriptionStarted(payload: KiwifyWebhookPayload) {
  console.log('🔄 Processando assinatura iniciada:', payload.subscription?.id)
  
  // Mesmo processo do pagamento aprovado
  await handleOrderPaid(payload)
}

// Handler para assinatura cancelada
async function handleSubscriptionCanceled(payload: KiwifyWebhookPayload) {
  console.log('❌ Processando cancelamento de assinatura:', payload.subscription?.id)

  try {
    const supabase = getSupabaseAdmin()
    const { data: userData } = await supabase.auth.admin.listUsers()
    const user = userData?.users.find(u => u.email === payload.customer.email)

    if (!user) {
      console.log('⚠️ Usuário não encontrado para cancelamento')
      return
    }

    // Atualizar status para cancelado
    await supabase
      .from('user_profiles')
      .update({
        subscription_status: 'canceled',
        subscription_canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    // Registrar transação de cancelamento
    await supabase.from('transactions').insert({
      user_id: user.id,
      order_id: payload.order_id,
      event_type: payload.event,
      amount: 0,
      customer_email: payload.customer.email,
      status: 'canceled',
      created_at: new Date().toISOString()
    })

    console.log('✅ Assinatura cancelada:', user.email)

  } catch (error) {
    console.error('Erro em handleSubscriptionCanceled:', error)
  }
}

// Handler para reembolso ou chargeback
async function handleOrderRefundedOrChargeback(payload: KiwifyWebhookPayload) {
  console.log('💸 Processando reembolso/chargeback:', payload.order_id)

  try {
    const supabase = getSupabaseAdmin()
    const { data: userData } = await supabase.auth.admin.listUsers()
    const user = userData?.users.find(u => u.email === payload.customer.email)

    if (!user) {
      console.log('⚠️ Usuário não encontrado para reembolso')
      return
    }

    // Remover acesso PRO
    await supabase
      .from('user_profiles')
      .update({
        is_pro: false,
        subscription_status: 'refunded',
        subscription_canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    // Registrar transação
    await supabase.from('transactions').insert({
      user_id: user.id,
      order_id: payload.order_id,
      event_type: payload.event,
      amount: -payload.amount,
      customer_email: payload.customer.email,
      status: 'refunded',
      created_at: new Date().toISOString()
    })

    console.log('✅ Reembolso processado:', user.email)

  } catch (error) {
    console.error('Erro em handleOrderRefundedOrChargeback:', error)
  }
}

// Método GET para verificar se o endpoint está funcionando
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Webhook Kiwify endpoint está funcionando',
    timestamp: new Date().toISOString()
  })
}
