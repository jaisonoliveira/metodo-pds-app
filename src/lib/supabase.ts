import { createClient } from '@supabase/supabase-js'

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Tipos para o banco de dados
export type Profile = {
  id: string
  name: string
  invite_link: string | null
  created_at: string
  updated_at: string
}

export type Content = {
  id: string
  type: 'treino' | 'dieta' | 'sedução'
  title: string
  description: string | null
  media_url: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type Comment = {
  id: string
  user_id: string
  content_id: string
  text: string
  likes: number
  created_at: string
  updated_at: string
}
