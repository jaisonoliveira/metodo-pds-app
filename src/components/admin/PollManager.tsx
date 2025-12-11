"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, X, BarChart3, Eye, EyeOff, Trash2, Save } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Poll {
  id: string
  title: string
  description: string | null
  question: string
  options: { id: string; text: string; votes: number }[]
  is_active: boolean
  created_at: string
}

interface PollManagerProps {
  userEmail: string
}

export function PollManager({ userEmail }: PollManagerProps) {
  const [polls, setPolls] = useState<Poll[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    question: "",
    options: ["", ""]
  })

  useEffect(() => {
    loadPolls()
  }, [])

  const loadPolls = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setPolls(data)
    } catch (error) {
      console.error("Erro ao carregar enquetes:", error)
    }
  }

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ""]
    })
  }

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData({ ...formData, options: newOptions })
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const handleCreatePoll = async () => {
    if (!formData.title || !formData.question || formData.options.some(opt => !opt)) {
      alert("Preencha todos os campos obrigatórios!")
      return
    }

    try {
      const pollOptions = formData.options.map((text, index) => ({
        id: `option_${index + 1}`,
        text,
        votes: 0
      }))

      const { error } = await supabase
        .from('polls')
        .insert({
          title: formData.title,
          description: formData.description || null,
          question: formData.question,
          options: pollOptions,
          is_active: false,
          created_by: userEmail
        })

      if (error) throw error

      setFormData({
        title: "",
        description: "",
        question: "",
        options: ["", ""]
      })
      setShowForm(false)
      loadPolls()
    } catch (error) {
      console.error("Erro ao criar enquete:", error)
      alert("Erro ao criar enquete. Tente novamente.")
    }
  }

  const handleToggleActive = async (pollId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('polls')
        .update({ is_active: !currentStatus })
        .eq('id', pollId)

      if (error) throw error
      loadPolls()
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
    }
  }

  const getTotalVotes = (poll: Poll) => {
    return poll.options.reduce((sum, opt) => sum + opt.votes, 0)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                Gerenciar Enquetes
              </h2>
              <p className="text-gray-400">
                Crie enquetes que aparecerão na tela principal quando ativadas
              </p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {showForm ? "Cancelar" : "Nova Enquete"}
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent className="border-t border-white/10 pt-6">
            <div className="space-y-4">
              <div>
                <Label className="text-white mb-2 block">Título da Enquete</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Qual conteúdo você prefere?"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Descrição (opcional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Adicione uma descrição..."
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Pergunta</Label>
                <Input
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Ex: O que você quer ver mais?"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Opções de Resposta</Label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                        className="bg-white/10 border-white/20 text-white"
                      />
                      {formData.options.length > 2 && (
                        <Button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={handleAddOption}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Opção
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleCreatePoll}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Save className="w-4 h-4 mr-2" />
                Criar Enquete
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Lista de Enquetes */}
      <div className="space-y-4">
        {polls.length === 0 ? (
          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardContent className="py-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Nenhuma enquete criada ainda</p>
              <p className="text-gray-500 text-sm mt-2">
                Clique em "Nova Enquete" para começar
              </p>
            </CardContent>
          </Card>
        ) : (
          polls.map((poll) => (
            <Card key={poll.id} className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-white">{poll.title}</h3>
                      {poll.is_active ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <Eye className="w-3 h-3 mr-1" />
                          Ativa
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Inativa
                        </Badge>
                      )}
                    </div>
                    {poll.description && (
                      <p className="text-gray-400 text-sm mb-2">{poll.description}</p>
                    )}
                    <p className="text-white font-medium">{poll.question}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleToggleActive(poll.id, poll.is_active)}
                      size="sm"
                      variant="outline"
                      className={
                        poll.is_active
                          ? "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                          : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                      }
                    >
                      {poll.is_active ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          Ativar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  {poll.options.map((option) => {
                    const totalVotes = getTotalVotes(poll)
                    const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0

                    return (
                      <div key={option.id} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white">{option.text}</span>
                          <span className="text-gray-400 text-sm">
                            {option.votes} votos ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  Total de votos: {getTotalVotes(poll)} | Criada em:{" "}
                  {new Date(poll.created_at).toLocaleDateString("pt-BR")}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
