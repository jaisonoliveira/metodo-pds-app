"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Poll {
  id: string
  title: string
  description: string | null
  question: string
  options: { id: string; text: string; votes: number }[]
  is_active: boolean
}

interface PollWidgetProps {
  userId: string
  userEmail: string
}

export function PollWidget({ userId, userEmail }: PollWidgetProps) {
  const [activePolls, setActivePolls] = useState<Poll[]>([])
  const [votedPolls, setVotedPolls] = useState<string[]>([])
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  useEffect(() => {
    loadActivePolls()
    loadUserVotes()
  }, [])

  const loadActivePolls = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setActivePolls(data)
    } catch (error) {
      console.error("Erro ao carregar enquetes:", error)
    }
  }

  const loadUserVotes = async () => {
    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .select('poll_id')
        .eq('user_id', userId)

      if (error) throw error
      if (data) setVotedPolls(data.map(v => v.poll_id))
    } catch (error) {
      console.error("Erro ao carregar votos:", error)
    }
  }

  const handleVote = async (pollId: string) => {
    const optionId = selectedOptions[pollId]
    if (!optionId) {
      alert("Selecione uma opção!")
      return
    }

    try {
      // Registrar voto
      const { error: voteError } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_id: userId,
          user_email: userEmail,
          option_id: optionId
        })

      if (voteError) throw voteError

      // Atualizar contagem de votos
      const poll = activePolls.find(p => p.id === pollId)
      if (poll) {
        const updatedOptions = poll.options.map(opt =>
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        )

        const { error: updateError } = await supabase
          .from('polls')
          .update({ options: updatedOptions })
          .eq('id', pollId)

        if (updateError) throw updateError

        setVotedPolls(prev => [...prev, pollId])
        loadActivePolls()
      }
    } catch (error) {
      console.error("Erro ao votar:", error)
      alert("Erro ao registrar voto. Tente novamente.")
    }
  }

  const getTotalVotes = (poll: Poll) => {
    return poll.options.reduce((sum, opt) => sum + opt.votes, 0)
  }

  const getPercentage = (poll: Poll, optionVotes: number) => {
    const total = getTotalVotes(poll)
    return total > 0 ? (optionVotes / total) * 100 : 0
  }

  if (activePolls.length === 0) return null

  return (
    <div className="space-y-4">
      {activePolls.map((poll) => {
        const hasVoted = votedPolls.includes(poll.id)
        const totalVotes = getTotalVotes(poll)

        return (
          <Card key={poll.id} className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    <CardTitle className="text-white">{poll.title}</CardTitle>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Ativa
                    </Badge>
                  </div>
                  {poll.description && (
                    <p className="text-gray-400 text-sm">{poll.description}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-white font-semibold mb-4">{poll.question}</h3>

              {hasVoted ? (
                // Mostrar resultados após votar
                <div className="space-y-3">
                  {poll.options.map((option) => {
                    const percentage = getPercentage(poll, option.votes)
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
                  <div className="flex items-center gap-2 text-green-400 text-sm mt-4">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Você já votou nesta enquete</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Total de votos: {totalVotes}
                  </p>
                </div>
              ) : (
                // Mostrar opções para votar
                <div className="space-y-3">
                  {poll.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedOptions(prev => ({ ...prev, [poll.id]: option.id }))}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedOptions[poll.id] === option.id
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-white">{option.text}</span>
                    </button>
                  ))}
                  <Button
                    onClick={() => handleVote(poll.id)}
                    disabled={!selectedOptions[poll.id]}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Votar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
