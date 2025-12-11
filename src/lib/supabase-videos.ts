import { supabase } from './supabase'

export interface WelcomeVideo {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url?: string
  is_free: boolean
  order_index: number
  likes: number
  views: number
  created_at: string
  updated_at: string
}

export interface VideoComment {
  id: string
  video_id: string
  user_id: string
  user_name: string
  comment_text: string
  likes: number
  created_at: string
  updated_at: string
}

// Buscar todos os vídeos de boas-vindas
export async function getWelcomeVideos() {
  try {
    const { data, error } = await supabase
      .from('welcome_videos')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      // Retornar array vazio silenciosamente se a tabela não existir
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return []
      }
      console.error('Erro ao buscar vídeos:', error)
      return []
    }

    return data as WelcomeVideo[]
  } catch (err) {
    // Capturar qualquer erro de conexão ou configuração
    console.error('Erro ao conectar com Supabase:', err)
    return []
  }
}

// Buscar comentários de um vídeo
export async function getVideoComments(videoId: string) {
  try {
    const { data, error } = await supabase
      .from('video_comments')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: false })

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return []
      }
      console.error('Erro ao buscar comentários:', error)
      return []
    }

    return data as VideoComment[]
  } catch (err) {
    console.error('Erro ao conectar com Supabase:', err)
    return []
  }
}

// Adicionar comentário
export async function addComment(videoId: string, userId: string, userName: string, commentText: string) {
  try {
    const { data, error } = await supabase
      .from('video_comments')
      .insert({
        video_id: videoId,
        user_id: userId,
        user_name: userName,
        comment_text: commentText
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao adicionar comentário:', error)
      throw error
    }

    return data as VideoComment
  } catch (err) {
    console.error('Erro ao conectar com Supabase:', err)
    throw err
  }
}

// Curtir vídeo
export async function likeVideo(videoId: string, userId: string) {
  try {
    // Verificar se já curtiu
    const { data: existingLike } = await supabase
      .from('video_likes')
      .select('id')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .single()

    if (existingLike) {
      return false
    }

    // Adicionar curtida
    const { error: likeError } = await supabase
      .from('video_likes')
      .insert({ video_id: videoId, user_id: userId })

    if (likeError) {
      console.error('Erro ao curtir vídeo:', likeError)
      return false
    }

    // Buscar o vídeo atual para incrementar likes
    const { data: video } = await supabase
      .from('welcome_videos')
      .select('likes')
      .eq('id', videoId)
      .single()

    if (video) {
      // Incrementar contador de likes no vídeo
      const { error: updateError } = await supabase
        .from('welcome_videos')
        .update({ likes: (video.likes || 0) + 1 })
        .eq('id', videoId)

      if (updateError) {
        console.error('Erro ao atualizar likes do vídeo:', updateError)
      }
    }

    return true
  } catch (err) {
    console.error('Erro ao conectar com Supabase:', err)
    return false
  }
}

// Curtir comentário
export async function likeComment(commentId: string, userId: string) {
  try {
    // Verificar se já curtiu
    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single()

    if (existingLike) {
      return false
    }

    // Adicionar curtida
    const { error: likeError } = await supabase
      .from('comment_likes')
      .insert({ comment_id: commentId, user_id: userId })

    if (likeError) {
      console.error('Erro ao curtir comentário:', likeError)
      return false
    }

    // Buscar o comentário atual para incrementar likes
    const { data: comment } = await supabase
      .from('video_comments')
      .select('likes')
      .eq('id', commentId)
      .single()

    if (comment) {
      // Incrementar contador de likes no comentário
      const { error: updateError } = await supabase
        .from('video_comments')
        .update({ likes: (comment.likes || 0) + 1 })
        .eq('id', commentId)

      if (updateError) {
        console.error('Erro ao atualizar likes do comentário:', updateError)
      }
    }

    return true
  } catch (err) {
    console.error('Erro ao conectar com Supabase:', err)
    return false
  }
}

// Marcar vídeo como assistido
export async function markVideoAsWatched(videoId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('watched_videos')
      .insert({ video_id: videoId, user_id: userId })

    if (error) {
      console.error('Erro ao marcar vídeo como assistido:', error)
      return false
    }

    // Buscar o vídeo atual para incrementar views
    const { data: video } = await supabase
      .from('welcome_videos')
      .select('views')
      .eq('id', videoId)
      .single()

    if (video) {
      // Incrementar contador de views
      await supabase
        .from('welcome_videos')
        .update({ views: (video.views || 0) + 1 })
        .eq('id', videoId)
    }

    return true
  } catch (err) {
    console.error('Erro ao conectar com Supabase:', err)
    return false
  }
}

// Verificar se usuário já assistiu o vídeo
export async function hasWatchedVideo(videoId: string, userId: string) {
  try {
    const { data } = await supabase
      .from('watched_videos')
      .select('id')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .single()

    return !!data
  } catch (err) {
    return false
  }
}

// Verificar se usuário curtiu o vídeo
export async function hasLikedVideo(videoId: string, userId: string) {
  try {
    const { data } = await supabase
      .from('video_likes')
      .select('id')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .single()

    return !!data
  } catch (err) {
    return false
  }
}

// Verificar se usuário curtiu o comentário
export async function hasLikedComment(commentId: string, userId: string) {
  try {
    const { data } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single()

    return !!data
  } catch (err) {
    return false
  }
}
