import { supabase } from './supabase'

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

  // Não criar perfil na tabela profiles - usar apenas auth.users metadata
  // Se houver um indicador, registrar a indicação
  if (data.user && referrerId) {
    try {
      const { registrarIndicacao } = await import('./referrals')
      await registrarIndicacao(referrerId, data.user.id)
      console.log('✅ Indicação registrada com sucesso!')
    } catch (indicacaoError) {
      console.error('Erro ao registrar indicação:', indicacaoError)
      // Não bloquear o cadastro se houver erro na indicação
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
  // Retornar dados do auth.users em vez da tabela profiles
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user?.id === userId) {
    return {
      id: user.id,
      name: user.user_metadata?.name,
      whatsapp: user.user_metadata?.whatsapp,
      email: user.email
    }
  }
  
  return null
}
