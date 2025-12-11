"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MessageSquare, Download } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Feedback {
  id: string
  user_email: string
  user_name: string | null
  satisfaction_rating: number | null
  what_liked_most: string | null
  easy_navigation: boolean | null
  improvement_suggestions: string | null
  most_used_features: string | null
  desired_features: string | null
  support_rating: number | null
  doubts_resolved: boolean | null
  open_feedback: string | null
  created_at: string
}

export function FeedbackViewer() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeedbacks()
  }, [])

  const loadFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback_forms')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setFeedbacks(data)
    } catch (error) {
      console.error("Erro ao carregar feedbacks:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-gray-500">Não avaliado</span>
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
            }`}
          />
        ))}
      </div>
    )
  }

  const exportToCSV = () => {
    const headers = [
      "Data",
      "Nome",
      "Email",
      "Satisfação",
      "O que mais gostou",
      "Navegação fácil",
      "Sugestões de melhoria",
      "Funcionalidades mais usadas",
      "Funcionalidades desejadas",
      "Avaliação do suporte",
      "Dúvidas resolvidas",
      "Feedback aberto"
    ]

    const rows = feedbacks.map((fb) => [
      new Date(fb.created_at).toLocaleDateString("pt-BR"),
      fb.user_name || "",
      fb.user_email,
      fb.satisfaction_rating || "",
      fb.what_liked_most || "",
      fb.easy_navigation === null ? "" : fb.easy_navigation ? "Sim" : "Não",
      fb.improvement_suggestions || "",
      fb.most_used_features || "",
      fb.desired_features || "",
      fb.support_rating || "",
      fb.doubts_resolved === null ? "" : fb.doubts_resolved ? "Sim" : "Não",
      fb.open_feedback || ""
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `feedbacks_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  if (loading) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardContent className="py-12 text-center">
          <p className="text-gray-400">Carregando feedbacks...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-sm border-blue-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-400" />
                Feedbacks Recebidos ({feedbacks.length})
              </h2>
              <p className="text-gray-400">
                Visualize todos os feedbacks enviados pelos usuários
              </p>
            </div>
            {feedbacks.length > 0 && (
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {feedbacks.length === 0 ? (
        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhum feedback recebido ainda</p>
            <p className="text-gray-500 text-sm mt-2">
              Os feedbacks aparecerão aqui quando os usuários enviarem
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id} className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {feedback.user_name || "Usuário"}
                    </h3>
                    <p className="text-gray-400 text-sm">{feedback.user_email}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(feedback.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Satisfação Geral */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Satisfação Geral</h4>
                    {renderStars(feedback.satisfaction_rating)}
                    {feedback.what_liked_most && (
                      <p className="text-gray-400 text-sm mt-2">
                        <strong>O que mais gostou:</strong> {feedback.what_liked_most}
                      </p>
                    )}
                  </div>

                  {/* Facilidade de Uso */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Facilidade de Uso</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-400 text-sm">Navegação fácil:</span>
                      {feedback.easy_navigation === null ? (
                        <Badge className="bg-gray-500/20 text-gray-400">Não respondido</Badge>
                      ) : feedback.easy_navigation ? (
                        <Badge className="bg-green-500/20 text-green-400">Sim</Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-400">Não</Badge>
                      )}
                    </div>
                    {feedback.improvement_suggestions && (
                      <p className="text-gray-400 text-sm mt-2">
                        <strong>Sugestões:</strong> {feedback.improvement_suggestions}
                      </p>
                    )}
                  </div>

                  {/* Funcionalidades */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Funcionalidades</h4>
                    {feedback.most_used_features && (
                      <p className="text-gray-400 text-sm mb-2">
                        <strong>Mais usadas:</strong> {feedback.most_used_features}
                      </p>
                    )}
                    {feedback.desired_features && (
                      <p className="text-gray-400 text-sm">
                        <strong>Desejadas:</strong> {feedback.desired_features}
                      </p>
                    )}
                  </div>

                  {/* Suporte */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Suporte</h4>
                    {renderStars(feedback.support_rating)}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-gray-400 text-sm">Dúvidas resolvidas:</span>
                      {feedback.doubts_resolved === null ? (
                        <Badge className="bg-gray-500/20 text-gray-400">Não respondido</Badge>
                      ) : feedback.doubts_resolved ? (
                        <Badge className="bg-green-500/20 text-green-400">Sim</Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-400">Não</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Feedback Aberto */}
                {feedback.open_feedback && (
                  <div className="bg-white/5 rounded-lg p-4 mt-4">
                    <h4 className="text-white font-semibold mb-2">Feedback Aberto</h4>
                    <p className="text-gray-400 text-sm">{feedback.open_feedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
