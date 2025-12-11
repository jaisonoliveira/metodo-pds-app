"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ExternalLink } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

interface Notification {
  id: string
  title: string
  message: string
  link: string | null
  icon: string | null
  sent_at: string
}

export function NotificationBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [dismissedIds, setDismissedIds] = useState<string[]>([])

  useEffect(() => {
    loadNotifications()

    // Inscrever-se para atualizações em tempo real
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(5)

      if (error) throw error
      if (data) setNotifications(data)
    } catch (error) {
      console.error("Erro ao carregar notificações:", error)
    }
  }

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => [...prev, id])
  }

  const visibleNotifications = notifications.filter(n => !dismissedIds.includes(n.id))

  if (visibleNotifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {visibleNotifications.map((notification) => (
        <Card 
          key={notification.id} 
          className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm border-orange-400/50 shadow-2xl animate-in slide-in-from-right duration-300"
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">
                {notification.icon === 'bell' ? '🔔' :
                 notification.icon === 'info' ? 'ℹ️' :
                 notification.icon === 'star' ? '⭐' :
                 notification.icon === 'fire' ? '🔥' :
                 notification.icon === 'gift' ? '🎁' : '🔔'}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold mb-1">{notification.title}</h4>
                <p className="text-white/90 text-sm mb-2">{notification.message}</p>
                {notification.link && (
                  <Link href={notification.link}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/20 text-xs"
                    >
                      Ver mais
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
              <Button
                onClick={() => handleDismiss(notification.id)}
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
