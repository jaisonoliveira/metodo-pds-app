import { supabase } from './supabase'
import { registrarIndicacao } from './referrals'

export async function signUp(email: string, password: string, name: string, whatsapp?: string, referrerId?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        whatsapp: whatsapp || null,
      },
    },
  })

  if (error) throw error

  // Criar perfil do usuário
  if (data.user) {
    const inviteLink = `${window.location.origin}?ref=${data.user.id}`
    
    // Remover formatação do WhatsApp para salvar apenas números
    const phoneNumbers = whatsapp ? whatsapp.replace(/\D/g, '') : null
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        name,
        email,
        phone: phoneNumbers, // Salvar na coluna phone (apenas números)
        whatsapp: whatsapp || null, // Salvar na coluna whatsapp (com formatação)
        invite_link: inviteLink
      })

    if (profileError) throw profileError

    // Se houver um indicador, registrar a indicação
    if (referrerId) {
      try {
        await registrarIndicacao(referrerId, data.user.id)
        console.log('✅ Indicação registrada com sucesso!')
      } catch (indicacaoError) {
        console.error('Erro ao registrar indicação:', indicacaoError)
        // Não bloquear o cadastro se houver erro na indicação
      }
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}
