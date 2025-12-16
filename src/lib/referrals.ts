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

    console.log('✅ Indicação registrada com sucesso!')
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
