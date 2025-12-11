"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Bell, Send, Trash2, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Notification {
  id: string
  title: string
  message: string
  link: string | null
  icon: string | null
  sent_at: string
  created_by: string
}

interface NotificationManagerProps {
  userEmail: string
}

export function NotificationManager({ userEmail }: NotificationManagerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    link: "",
    icon: "bell"
  })
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('sent_at', { ascending: false })

      if (error) throw error
      if (data) setNotifications(data)
    } catch (error) {
      console.error("Erro ao carregar notificações:", error)
    }
  }

  const handleSendNotification = async () => {
    if (!formData.title || !formData.message) {
      alert("Preencha título e mensagem!")
      return
    }

    setIsSending(true)
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          title: formData.title,
          message: formData.message,
          link: formData.link || null,
          icon: formData.icon,
          created_by: userEmail
        })

      if (error) throw error

      setFormData({
        title: "",
        message: "",
        link: "",
        icon: "bell"
      })
      loadNotifications()
      alert("Notificação enviada com sucesso!")
    } catch (error) {
      console.error("Erro ao enviar notificação:", error)
      alert("Erro ao enviar notificação. Tente novamente.")
    } finally {
      setIsSending(false)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta notificação?")) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadNotifications()
    } catch (error) {
      console.error("Erro ao excluir notificação:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Bell className="w-6 h-6 text-orange-400" />
                Notificações Push
              </h2>
              <p className="text-gray-400">
                Envie notificações discretas para todos os usuários
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label className="text-white mb-2 block">Título da Notificação</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Nova funcionalidade disponível!"
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div>
            <Label className="text-white mb-2 block">Mensagem</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Descreva a atualização ou informação importante..."
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div>
            <Label className="text-white mb-2 block">Link (opcional)</Label>
            <Input
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="Ex: /novidades"
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div>
            <Label className="text-white mb-2 block">Ícone</Label>
            <select
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="bell">🔔 Sino</option>
              <option value="info">ℹ️ Informação</option>
              <option value="star">⭐ Estrela</option>
              <option value="fire">🔥 Fogo</option>
              <option value="gift">🎁 Presente</option>
            </select>
          </div>

          <Button
            onClick={handleSendNotification}
            disabled={isSending}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {isSending ? (
              "Enviando..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Notificação para Todos
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de Notificações */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-400" />
            Histórico de Notificações ({notifications.length})
          </h3>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              Nenhuma notificação enviada ainda
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card key={notification.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{
                            notification.icon === 'bell' ? '🔔' :
                            notification.icon === 'info' ? 'ℹ️' :
                            notification.icon === 'star' ? '⭐' :
                            notification.icon === 'fire' ? '🔥' :
                            notification.icon === 'gift' ? '🎁' : '🔔'
                          }</span>
                          <h4 className="text-white font-semibold">{notification.title}</h4>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                        {notification.link && (
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                            Link: {notification.link}
                          </Badge>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Enviada em: {new Date(notification.sent_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDeleteNotification(notification.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
