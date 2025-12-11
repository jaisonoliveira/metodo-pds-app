import { supabase } from './supabase'

export type Indicacao = {
  id: string
  usuario_id: string
  indicacao_id: string
  data: string
}

/**
 * Registra uma nova indicação quando um usuário se cadastra via link de referência
 */
export async function registrarIndicacao(usuarioIndicadorId: string, novoUsuarioId: string) {
  try {
    const { data, error } = await supabase
      .from('indicacoes')
      .insert({
        usuario_id: usuarioIndicadorId,
        indicacao_id: novoUsuarioId,
        data: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Verificar se o usuário atingiu 5 indicações
    await verificarEConcederCreditos(usuarioIndicadorId)

    return data
  } catch (error) {
    console.error('Erro ao registrar indicação:', error)
    throw error
  }
}

/**
 * Conta quantas indicações válidas um usuário tem
 */
export async function contarIndicacoes(usuarioId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('indicacoes')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', usuarioId)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Erro ao contar indicações:', error)
    return 0
  }
}

/**
 * Busca todas as indicações de um usuário
 */
export async function buscarIndicacoes(usuarioId: string): Promise<Indicacao[]> {
  try {
    const { data, error } = await supabase
      .from('indicacoes')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('data', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar indicações:', error)
    return []
  }
}

/**
 * Verifica se o usuário atingiu 5 indicações e concede R$30 em créditos
 */
async function verificarEConcederCreditos(usuarioId: string) {
  try {
    const totalIndicacoes = await contarIndicacoes(usuarioId)
    
    // A cada 5 indicações, conceder R$30
    if (totalIndicacoes > 0 && totalIndicacoes % 5 === 0) {
      const creditosAConceder = 30
      
      // Buscar créditos atuais do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('creditos')
        .eq('id', usuarioId)
        .single()

      if (profileError) throw profileError

      const creditosAtuais = profile?.creditos || 0
      const novoTotalCreditos = Number(creditosAtuais) + creditosAConceder

      // Atualizar créditos do usuário
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ creditos: novoTotalCreditos })
        .eq('id', usuarioId)

      if (updateError) throw updateError

      console.log(`✅ Créditos concedidos! Usuário ${usuarioId} agora tem R$${novoTotalCreditos}`)
      
      return novoTotalCreditos
    }

    return null
  } catch (error) {
    console.error('Erro ao verificar e conceder créditos:', error)
    throw error
  }
}

/**
 * Busca os créditos atuais de um usuário
 */
export async function buscarCreditos(usuarioId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('creditos')
      .eq('id', usuarioId)
      .single()

    if (error) throw error
    return Number(data?.creditos || 0)
  } catch (error) {
    console.error('Erro ao buscar créditos:', error)
    return 0
  }
}

/**
 * Extrai o ID do usuário indicador de uma URL de referência
 */
export function extrairIdIndicadorDaUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const params = new URLSearchParams(urlObj.search)
    return params.get('ref')
  } catch {
    return null
  }
}
