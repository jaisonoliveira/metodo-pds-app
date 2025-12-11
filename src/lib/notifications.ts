/**
 * Sistema de Notificações Web
 * Gerencia permissões e envio de notificações push
 */

export type NotificationType = 'dieta' | 'treino' | 'seducao'

export interface NotificationConfig {
  type: NotificationType
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
}

/**
 * Verifica se o navegador suporta notificações
 */
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window
}

/**
 * Verifica o status da permissão de notificações
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) {
    return 'denied'
  }
  return Notification.permission
}

/**
 * Solicita permissão para enviar notificações
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    console.warn('Notificações não são suportadas neste navegador')
    return 'denied'
  }

  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificação:', error)
    return 'denied'
  }
}

/**
 * Envia uma notificação imediata
 */
export const sendNotification = (config: NotificationConfig): Notification | null => {
  if (!isNotificationSupported()) {
    console.warn('Notificações não são suportadas')
    return null
  }

  if (Notification.permission !== 'granted') {
    console.warn('Permissão de notificação não concedida')
    return null
  }

  try {
    const notification = new Notification(config.title, {
      body: config.body,
      icon: config.icon || '/icon.svg',
      badge: config.badge || '/icon.svg',
      tag: config.tag || config.type,
      requireInteraction: false,
      silent: false
    })

    // Auto-fechar após 10 segundos
    setTimeout(() => {
      notification.close()
    }, 10000)

    return notification
  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
    return null
  }
}

/**
 * Configurações de horários para cada tipo de notificação
 */
export const NOTIFICATION_SCHEDULES = {
  dieta: {
    hour: 8, // 8h da manhã
    minute: 0,
    title: '🥗 Lembrete de Dieta',
    body: 'Bom dia! Não esqueça de acompanhar suas calorias hoje. Mantenha o foco!'
  },
  treino: {
    hour: 15, // 15h da tarde
    minute: 0,
    title: '💪 Hora do Treino',
    body: 'Boa tarde! Está na hora do seu treino. Vamos conquistar seus objetivos!'
  },
  seducao: {
    hour: 20, // 20h da noite
    minute: 0,
    title: '❤️ Dica de Sedução',
    body: 'Boa noite! Confira a dica de sedução de hoje e aprimore suas habilidades sociais.'
  }
}

/**
 * Calcula o próximo horário de notificação
 */
export const getNextNotificationTime = (type: NotificationType): Date => {
  const schedule = NOTIFICATION_SCHEDULES[type]
  const now = new Date()
  const next = new Date()
  
  next.setHours(schedule.hour, schedule.minute, 0, 0)
  
  // Se o horário já passou hoje, agendar para amanhã
  if (next <= now) {
    next.setDate(next.getDate() + 1)
  }
  
  return next
}

/**
 * Calcula o tempo em milissegundos até a próxima notificação
 */
export const getTimeUntilNextNotification = (type: NotificationType): number => {
  const next = getNextNotificationTime(type)
  const now = new Date()
  return next.getTime() - now.getTime()
}

/**
 * Agenda uma notificação para um horário específico
 */
export const scheduleNotification = (type: NotificationType): number => {
  const schedule = NOTIFICATION_SCHEDULES[type]
  const delay = getTimeUntilNextNotification(type)
  
  const timeoutId = window.setTimeout(() => {
    sendNotification({
      type,
      title: schedule.title,
      body: schedule.body,
      tag: type
    })
    
    // Reagendar para o próximo dia
    scheduleNotification(type)
  }, delay)
  
  return timeoutId
}

/**
 * Cancela uma notificação agendada
 */
export const cancelScheduledNotification = (timeoutId: number): void => {
  window.clearTimeout(timeoutId)
}

/**
 * Salva preferências de notificação no localStorage
 */
export const saveNotificationPreferences = (preferences: {
  dieta: boolean
  treino: boolean
  seducao: boolean
}): void => {
  localStorage.setItem('notification_preferences', JSON.stringify(preferences))
}

/**
 * Carrega preferências de notificação do localStorage
 */
export const loadNotificationPreferences = (): {
  dieta: boolean
  treino: boolean
  seducao: boolean
} => {
  const stored = localStorage.getItem('notification_preferences')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return { dieta: true, treino: true, seducao: true }
    }
  }
  return { dieta: true, treino: true, seducao: true }
}

/**
 * Formata o tempo restante até a próxima notificação
 */
export const formatTimeUntilNext = (type: NotificationType): string => {
  const ms = getTimeUntilNextNotification(type)
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  return `${minutes}min`
}
