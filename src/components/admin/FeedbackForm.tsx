"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Star, CheckCircle2, Send } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface FeedbackFormProps {
  userEmail: string
  userName: string
  userId: string
}

export function FeedbackForm({ userEmail, userName, userId }: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    satisfactionRating: 0,
    whatLikedMost: "",
    easyNavigation: null as boolean | null,
    improvementSuggestions: "",
    mostUsedFeatures: "",
    desiredFeatures: "",
    supportRating: 0,
    doubtsResolved: null as boolean | null,
    openFeedback: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")

    try {
      const { error } = await supabase
        .from('feedback_forms')
        .insert({
          user_id: userId,
          user_email: userEmail,
          user_name: userName,
          satisfaction_rating: formData.satisfactionRating,
          what_liked_most: formData.whatLikedMost,
          easy_navigation: formData.easyNavigation,
          improvement_suggestions: formData.improvementSuggestions,
          most_used_features: formData.mostUsedFeatures,
          desired_features: formData.desiredFeatures,
          support_rating: formData.supportRating,
          doubts_resolved: formData.doubtsResolved,
          open_feedback: formData.openFeedback
        })

      if (error) throw error

      setSubmitSuccess(true)
      // Resetar formulário
      setFormData({
        satisfactionRating: 0,
        whatLikedMost: "",
        easyNavigation: null,
        improvementSuggestions: "",
        mostUsedFeatures: "",
        desiredFeatures: "",
        supportRating: 0,
        doubtsResolved: null,
        openFeedback: ""
      })

      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (error) {
      console.error("Erro ao enviar feedback:", error)
      setSubmitError("Erro ao enviar feedback. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number, setRating: (rating: number) => void) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-400"
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (submitSuccess) {
    return (
      <Card className="bg-green-500/10 border-green-500/30">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            Feedback Enviado com Sucesso!
          </h3>
          <p className="text-gray-400">
            Obrigado por compartilhar sua opinião. Seu feedback é muito importante para nós!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Satisfação Geral */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">1. Satisfação Geral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white mb-2 block">
              Avalie sua satisfação geral (1 a 5)
            </Label>
            {renderStars(formData.satisfactionRating, (rating) =>
              setFormData({ ...formData, satisfactionRating: rating })
            )}
          </div>
          <div>
            <Label className="text-white mb-2 block">
              O que mais gostou?
            </Label>
            <Textarea
              value={formData.whatLikedMost}
              onChange={(e) =>
                setFormData({ ...formData, whatLikedMost: e.target.value })
              }
              placeholder="Compartilhe o que você mais gostou..."
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Facilidade de Uso */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">2. Facilidade de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white mb-2 block">
              A navegação foi fácil?
            </Label>
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, easyNavigation: true })
                }
                className={
                  formData.easyNavigation === true
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-white/10 hover:bg-white/20"
                }
              >
                Sim
              </Button>
              <Button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, easyNavigation: false })
                }
                className={
                  formData.easyNavigation === false
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-white/10 hover:bg-white/20"
                }
              >
                Não
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-white mb-2 block">
              Sugestões de melhoria?
            </Label>
            <Textarea
              value={formData.improvementSuggestions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  improvementSuggestions: e.target.value
                })
              }
              placeholder="Como podemos melhorar a navegação?"
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Funcionalidades */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">3. Funcionalidades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white mb-2 block">
              Quais funcionalidades você mais usa?
            </Label>
            <Textarea
              value={formData.mostUsedFeatures}
              onChange={(e) =>
                setFormData({ ...formData, mostUsedFeatures: e.target.value })
              }
              placeholder="Ex: Vídeos de treino, PDFs de dieta..."
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <div>
            <Label className="text-white mb-2 block">
              Alguma nova funcionalidade desejada?
            </Label>
            <Textarea
              value={formData.desiredFeatures}
              onChange={(e) =>
                setFormData({ ...formData, desiredFeatures: e.target.value })
              }
              placeholder="Que funcionalidades você gostaria de ver?"
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Suporte */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">4. Suporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white mb-2 block">
              Avalie o suporte (1 a 5)
            </Label>
            {renderStars(formData.supportRating, (rating) =>
              setFormData({ ...formData, supportRating: rating })
            )}
          </div>
          <div>
            <Label className="text-white mb-2 block">
              Suas dúvidas foram resolvidas?
            </Label>
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, doubtsResolved: true })
                }
                className={
                  formData.doubtsResolved === true
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-white/10 hover:bg-white/20"
                }
              >
                Sim
              </Button>
              <Button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, doubtsResolved: false })
                }
                className={
                  formData.doubtsResolved === false
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-white/10 hover:bg-white/20"
                }
              >
                Não
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Feedback Aberto */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">5. Feedback Aberto</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="text-white mb-2 block">
            Comentários ou sugestões adicionais?
          </Label>
          <Textarea
            value={formData.openFeedback}
            onChange={(e) =>
              setFormData({ ...formData, openFeedback: e.target.value })
            }
            placeholder="Compartilhe qualquer comentário ou sugestão..."
            className="bg-white/10 border-white/20 text-white min-h-[120px]"
          />
        </CardContent>
      </Card>

      {submitError && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
          {submitError}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        {isSubmitting ? (
          "Enviando..."
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Enviar Feedback
          </>
        )}
      </Button>
    </form>
  )
}
