import { useState, useEffect, useCallback } from 'react'
import {
  requestNotificationPermission,
  getNotificationPermission,
  scheduleNotification,
  cancelScheduledNotification,
  saveNotificationPreferences,
  loadNotificationPreferences,
  sendNotification,
  isNotificationSupported,
  formatTimeUntilNext,
  type NotificationType,
  NOTIFICATION_SCHEDULES
} from '@/lib/notifications'

interface NotificationPreferences {
  dieta: boolean
  treino: boolean
  seducao: boolean
}

interface UseNotificationsReturn {
  permission: NotificationPermission
  preferences: NotificationPreferences
  isSupported: boolean
  requestPermission: () => Promise<void>
  toggleNotification: (type: NotificationType) => void
  testNotification: (type: NotificationType) => void
  getNextNotificationTime: (type: NotificationType) => string
}

/**
 * Hook customizado para gerenciar notificações
 */
export const useNotifications = (): UseNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    dieta: true,
    treino: true,
    seducao: true
  })
  const [scheduledIds, setScheduledIds] = useState<{
    dieta?: number
    treino?: number
    seducao?: number
  }>({})

  const isSupported = isNotificationSupported()

  // Carregar preferências e permissão ao montar
  useEffect(() => {
    if (isSupported) {
      setPermission(getNotificationPermission())
      const savedPreferences = loadNotificationPreferences()
      setPreferences(savedPreferences)
    }
  }, [isSupported])

  // Agendar notificações quando permissão for concedida e preferências mudarem
  useEffect(() => {
    if (permission === 'granted') {
      // Cancelar agendamentos anteriores
      Object.values(scheduledIds).forEach(id => {
        if (id) cancelScheduledNotification(id)
      })

      // Agendar novas notificações baseado nas preferências
      const newScheduledIds: typeof scheduledIds = {}

      if (preferences.dieta) {
        newScheduledIds.dieta = scheduleNotification('dieta')
      }
      if (preferences.treino) {
        newScheduledIds.treino = scheduleNotification('treino')
      }
      if (preferences.seducao) {
        newScheduledIds.seducao = scheduleNotification('seducao')
      }

      setScheduledIds(newScheduledIds)
    }

    // Cleanup ao desmontar
    return () => {
      Object.values(scheduledIds).forEach(id => {
        if (id) cancelScheduledNotification(id)
      })
    }
  }, [permission, preferences])

  /**
   * Solicita permissão de notificação ao usuário
   */
  const requestPermission = useCallback(async () => {
    const newPermission = await requestNotificationPermission()
    setPermission(newPermission)
  }, [])

  /**
   * Ativa/desativa notificações para um tipo específico
   */
  const toggleNotification = useCallback((type: NotificationType) => {
    setPreferences(prev => {
      const newPreferences = {
        ...prev,
        [type]: !prev[type]
      }
      saveNotificationPreferences(newPreferences)
      return newPreferences
    })
  }, [])

  /**
   * Envia uma notificação de teste imediatamente
   */
  const testNotification = useCallback((type: NotificationType) => {
    if (permission !== 'granted') {
      console.warn('Permissão de notificação não concedida')
      return
    }

    const schedule = NOTIFICATION_SCHEDULES[type]
    sendNotification({
      type,
      title: `${schedule.title} (TESTE)`,
      body: schedule.body,
      tag: `${type}-test`
    })
  }, [permission])

  /**
   * Retorna o tempo formatado até a próxima notificação
   */
  const getNextNotificationTime = useCallback((type: NotificationType): string => {
    if (!preferences[type]) {
      return 'Desativado'
    }
    return formatTimeUntilNext(type)
  }, [preferences])

  return {
    permission,
    preferences,
    isSupported,
    requestPermission,
    toggleNotification,
    testNotification,
    getNextNotificationTime
  }
}
