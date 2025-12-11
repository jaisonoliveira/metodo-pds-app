'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dumbbell, Calculator, Heart, Users, Crown, Share2, Check, ArrowRight, Star, Zap, Play, Bell, Info, Settings, Copy, CheckCircle2, ThumbsUp, MessageCircle, Send, Lock, BellRing, BellOff, ChefHat, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, signOut, getUserProfile } from "@/lib/auth"
import { 
  getWelcomeVideos, 
  getVideoComments, 
  addComment, 
  likeVideo, 
  likeComment, 
  markVideoAsWatched,
  hasWatchedVideo,
  hasLikedVideo,
  hasLikedComment,
  type WelcomeVideo,
  type VideoComment
} from "@/lib/supabase-videos"

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        
        // Buscar perfil do usuário para obter o nome
        if (currentUser) {
          try {
            const profile = await getUserProfile(currentUser.id)
            setUserProfile(profile)
          } catch (profileError) {
            console.error('Erro ao buscar perfil:', profileError)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      
      // Atualizar perfil quando sessão mudar
      if (session?.user) {
        try {
          const profile = await getUserProfile(session.user.id)
          setUserProfile(profile)
        } catch (profileError) {
          console.error('Erro ao buscar perfil:', profileError)
        }
      } else {
        setUserProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
      setUserProfile(null)
      router.refresh()
    } catch (error) {
      console.error('Erro ao sair:', error)
    }
  }

  const handleUpgradeToPro = () => {
    window.open("https://pay.kiwify.com.br/oerRgMe", "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  if (user) {
    return <AppContent user={user} userProfile={userProfile} onSignOut={handleSignOut} onUpgradeToPro={handleUpgradeToPro} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 to-transparent"></div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-0 text-sm px-4 py-2">
              <Crown className="w-4 h-4 mr-2 inline" />
              Mais de 10.000 pessoas transformadas
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Transforme Seu Corpo,<br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Mente e Vida Social
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              O único método completo que une <strong className="text-white">treino científico</strong>, 
              <strong className="text-white"> nutrição estratégica</strong> e 
              <strong className="text-white"> desenvolvimento pessoal</strong> em uma única plataforma
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link href="/register">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg px-8 py-6 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  CRIAR CONTA GRÁTIS
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Link href="/login">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold text-lg px-8 py-6"
                >
                  Já tenho conta
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Acesso imediato</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-black/30 backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">10k+</div>
              <div className="text-gray-400">Membros Ativos</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">4.9★</div>
              <div className="text-gray-400">Avaliação Média</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">95%</div>
              <div className="text-gray-400">Taxa de Sucesso</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">Suporte Ativo</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-transparent to-black/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12">
              Você Está Cansado de...
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="bg-red-500/10 border-red-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-red-400 mb-3 text-lg font-semibold">❌ Treinar sem resultados</div>
                  <p className="text-gray-300">Passar horas na academia sem ver mudanças reais no seu corpo</p>
                </CardContent>
              </Card>
              
              <Card className="bg-red-500/10 border-red-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-red-400 mb-3 text-lg font-semibold">❌ Dietas impossíveis</div>
                  <p className="text-gray-300">Seguir planos alimentares complicados que você não consegue manter</p>
                </CardContent>
              </Card>
              
              <Card className="bg-red-500/10 border-red-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-red-400 mb-3 text-lg font-semibold">❌ Insegurança social</div>
                  <p className="text-gray-300">Não saber como se comunicar e criar conexões genuínas</p>
                </CardContent>
              </Card>
              
              <Card className="bg-red-500/10 border-red-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-red-400 mb-3 text-lg font-semibold">❌ Informação dispersa</div>
                  <p className="text-gray-300">Perder tempo buscando conteúdo em várias plataformas diferentes</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mb-12">
              <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 p-1 rounded-full mb-8">
                <div className="bg-slate-900 rounded-full px-8 py-4">
                  <span className="text-2xl font-bold text-white">A Solução Está Aqui 👇</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
            O Método PDS Completo
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
            Tudo que você precisa para se tornar a melhor versão de si mesmo, em um só lugar
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <Dumbbell className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Treinos Científicos</h3>
                <p className="text-gray-400 mb-4">
                  Programas de treino baseados em ciência, adaptados para todos os níveis
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Hipertrofia e definição</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Vídeos demonstrativos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Progressão personalizada</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-sm border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <ChefHat className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Nutrição Estratégica</h3>
                <p className="text-gray-400 mb-4">
                  Planos alimentares práticos e sustentáveis para seus objetivos
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Dicas de receitas gratuitas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>50+ cardápios prontos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Receitas práticas</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30 hover:border-pink-500/60 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Desenvolvimento Social</h3>
                <p className="text-gray-400 mb-4">
                  Aprenda a se comunicar, seduzir e criar conexões autênticas
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Linguagem corporal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Técnicas de comunicação</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Confiança e carisma</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-sm border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Comunidade Exclusiva</h3>
                <p className="text-gray-400 mb-4">
                  Conecte-se com homens que compartilham os mesmos objetivos
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Grupo VIP no WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Lives mensais exclusivas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Suporte 24/7</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-transparent to-black/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
            Escolha Seu Plano
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
            Comece grátis e evolua para PRO quando estiver pronto
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="bg-black/40 backdrop-blur-sm border-white/20">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Plano Gratuito</h3>
                  <div className="text-5xl font-bold text-white mb-2">R$ 0</div>
                  <p className="text-gray-400">Para sempre</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">1 aula gratuita de treino</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Dica de receita básica gratuita</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">eBook de sedução gratuito</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Acesso ao fórum público</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">2 exemplos de cardápios</span>
                  </li>
                </ul>
                
                <Link href="/register">
                  <Button 
                    className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/30"
                    size="lg"
                  >
                    Começar Grátis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-2 border-purple-500/50 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-0 px-3 py-1">
                  <Crown className="w-4 h-4 mr-1 inline" />
                  MAIS POPULAR
                </Badge>
              </div>
              
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Plano PRO</h3>
                  <div className="text-5xl font-bold text-white mb-2">R$ 29,90</div>
                  <p className="text-gray-300">por mês</p>
                  <p className="text-sm text-gray-400 mt-2">Cancele quando quiser</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white font-semibold">Tudo do plano gratuito +</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200">Programas completos de treino</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200">50+ cardápios personalizados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200">Audiobook completo de sedução</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200">Grupo VIP no WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200">Lives exclusivas mensais</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200">Dicas semanais exclusivas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200">Suporte prioritário 24/7</span>
                  </li>
                </ul>
                
                <Button 
                  onClick={() => window.open("https://pay.kiwify.com.br/oerRgMe", "_blank")}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Assinar PRO Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <p className="text-center text-sm text-gray-400 mt-4">
                  🔒 Pagamento seguro • Garantia de 7 dias
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-purple-600/20 to-pink-600/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Pronto Para Sua Transformação?
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Junte-se a mais de 10.000 pessoas que já transformaram suas vidas com o Método PDS
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link href="/register">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xl px-12 py-8 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                >
                  <Zap className="w-6 h-6 mr-2" />
                  CRIAR CONTA GRÁTIS
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Sem compromisso</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Acesso imediato</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Garantia de 7 dias</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black/40 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Método PDS</span>
            </div>
            
            <div className="text-center text-gray-400">
              <p>© 2024 Método PDS - Todos os direitos reservados</p>
              <p className="mt-1 text-sm">Transforme seu corpo, mente e vida social</p>
            </div>
            
            <div className="flex gap-4 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Termos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

interface AppContentProps {
  user: any
  userProfile: any
  onSignOut: () => void
  onUpgradeToPro: () => void
}

function AppContent({ user, userProfile, onSignOut, onUpgradeToPro }: AppContentProps) {
  const [isPro, setIsPro] = useState(false)
  const [freePreviewsUsed, setFreePreviewsUsed] = useState(0)
  const [referrals, setReferrals] = useState(0)
  const [credits, setCredits] = useState(0)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [referralLinkCopied, setReferralLinkCopied] = useState(false)
  const [showWelcomeVideos, setShowWelcomeVideos] = useState(true)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")
  const [videoWatched, setVideoWatched] = useState<Record<string, boolean>>({})
  const [welcomeVideos, setWelcomeVideos] = useState<WelcomeVideo[]>([])
  const [videoComments, setVideoComments] = useState<Record<string, VideoComment[]>>({})
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [videoLikedByUser, setVideoLikedByUser] = useState<Record<string, boolean>>({})
  const [commentLikedByUser, setCommentLikedByUser] = useState<Record<string, boolean>>({})

  const MAX_FREE_PREVIEWS = 3

  const referralLink = `https://c7e1fc10-metodo-pds-app-kappa.lasy.pro/?ref=${user.id}`

  // Carregar vídeos do Supabase
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const videos = await getWelcomeVideos()
        
        // Filtrar vídeos: usuários gratuitos veem apenas vídeos gratuitos
        const filteredVideos = isPro ? videos : videos.filter(v => v.is_free)
        
        setWelcomeVideos(filteredVideos)

        // Carregar comentários e status de curtidas para cada vídeo
        for (const video of filteredVideos) {
          const comments = await getVideoComments(video.id)
          setVideoComments(prev => ({ ...prev, [video.id]: comments }))

          // Verificar se usuário já assistiu
          const watched = await hasWatchedVideo(video.id, user.id)
          setVideoWatched(prev => ({ ...prev, [video.id]: watched }))

          // Verificar se usuário curtiu o vídeo
          const liked = await hasLikedVideo(video.id, user.id)
          setVideoLikedByUser(prev => ({ ...prev, [video.id]: liked }))

          // Verificar curtidas nos comentários
          for (const comment of comments) {
            const commentLiked = await hasLikedComment(comment.id, user.id)
            setCommentLikedByUser(prev => ({ ...prev, [comment.id]: commentLiked }))
          }
        }
      } catch (error) {
        console.error('Erro ao carregar vídeos:', error)
      } finally {
        setLoadingVideos(false)
      }
    }

    if (user) {
      loadVideos()
    }
  }, [user, isPro])

  // Função para obter o nome de exibição do usuário
  const getUserDisplayName = () => {
    if (userProfile?.name) {
      return userProfile.name
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name
    }
    return user?.email || "Usuário"
  }

  const handleContentAccess = () => {
    if (!isPro) {
      if (freePreviewsUsed >= MAX_FREE_PREVIEWS) {
        setShowUpgradeModal(true)
        return false
      }
      setFreePreviewsUsed(prev => prev + 1)
    }
    return true
  }

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    setReferralLinkCopied(true)
    setTimeout(() => setReferralLinkCopied(false), 3000)
  }

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `🔥 Descobri o Método PDS e está mudando minha vida! Treino, nutrição e desenvolvimento pessoal tudo em um lugar.\\n\\n` +
      `Use meu link exclusivo e comece sua transformação: ${referralLink}`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const handleReferral = () => {
    const newReferrals = referrals + 1
    setReferrals(newReferrals)
    
    if (newReferrals >= 5) {
      const creditsToAdd = Math.floor(newReferrals / 5) * 30
      setCredits(creditsToAdd)
    }
  }

  const handleLikeVideo = async (videoId: string) => {
    try {
      const success = await likeVideo(videoId, user.id)
      if (success) {
        setVideoLikedByUser(prev => ({ ...prev, [videoId]: true }))
        setWelcomeVideos(welcomeVideos.map(v => 
          v.id === videoId ? { ...v, likes: v.likes + 1 } : v
        ))
      }
    } catch (error) {
      console.error('Erro ao curtir vídeo:', error)
    }
  }

  const handleLikeComment = async (videoId: string, commentId: string) => {
    try {
      const success = await likeComment(commentId, user.id)
      if (success) {
        setCommentLikedByUser(prev => ({ ...prev, [commentId]: true }))
        setVideoComments(prev => ({
          ...prev,
          [videoId]: prev[videoId].map(c => 
            c.id === commentId ? { ...c, likes: c.likes + 1 } : c
          )
        }))
      }
    } catch (error) {
      console.error('Erro ao curtir comentário:', error)
    }
  }

  const handleAddComment = async (videoId: string) => {
    if (!newComment.trim()) return

    try {
      const comment = await addComment(videoId, user.id, getUserDisplayName(), newComment)
      setVideoComments(prev => ({
        ...prev,
        [videoId]: [comment, ...(prev[videoId] || [])]
      }))
      setNewComment("")
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
    }
  }

  const handleSkipVideo = async (videoId: string) => {
    try {
      await markVideoAsWatched(videoId, user.id)
      setVideoWatched(prev => ({ ...prev, [videoId]: true }))
    } catch (error) {
      console.error('Erro ao marcar vídeo como assistido:', error)
    }
  }

  const handleCloseWelcomeVideos = () => {
    setShowWelcomeVideos(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Método PDS</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button 
                variant="outline" 
                size="sm"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
            
            {isPro ? (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-0">
                <Crown className="w-3 h-3 mr-1" />
                PRO
              </Badge>
            ) : (
              <Badge variant="outline" className="border-white/30 text-white">
                Gratuito ({MAX_FREE_PREVIEWS - freePreviewsUsed} prévias restantes)
              </Badge>
            )}
            {credits > 0 && (
              <Badge className="bg-green-600 text-white border-0">
                R$ {credits} em créditos
              </Badge>
            )}
            
            <Button
              onClick={onSignOut}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Plataforma de Vídeos de Boas-Vindas */}
        {showWelcomeVideos && !loadingVideos && welcomeVideos.length > 0 && (
          <Card className="mb-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Play className="w-6 h-6 text-purple-400" />
                    Vídeos de Boas-Vindas
                  </h2>
                  <p className="text-gray-300 mt-2">
                    Assista aos vídeos de boas-vindas e deixe seu comentário!
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseWelcomeVideos}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {welcomeVideos.map((video) => (
                <div key={video.id} className="space-y-4">
                  {/* Vídeo Player */}
                  <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                    {!videoWatched[video.id] && (
                      <div className="absolute top-4 right-4 z-10">
                        <Button
                          onClick={() => handleSkipVideo(video.id)}
                          size="sm"
                          variant="outline"
                          className="bg-black/60 backdrop-blur-sm border-white/30 text-white hover:bg-black/80"
                        >
                          Pular Vídeo
                        </Button>
                      </div>
                    )}
                    {!video.is_free && !isPro && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20">
                        <div className="text-center">
                          <Lock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                          <h3 className="text-2xl font-bold text-white mb-2">Conteúdo Exclusivo PRO</h3>
                          <p className="text-gray-300 mb-4">Assine o plano PRO para acessar este vídeo</p>
                          <Button
                            onClick={onUpgradeToPro}
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Assinar PRO
                          </Button>
                        </div>
                      </div>
                    )}
                    <iframe
                      src={video.video_url}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>

                  {/* Informações do Vídeo */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{video.title}</h3>
                    <p className="text-gray-400 mb-4">{video.description}</p>
                    
                    <div className="flex items-center gap-6 mb-6">
                      <Button
                        onClick={() => handleLikeVideo(video.id)}
                        variant="outline"
                        size="sm"
                        disabled={videoLikedByUser[video.id]}
                        className={`border-white/20 hover:bg-white/10 ${
                          videoLikedByUser[video.id] ? 'text-blue-400 border-blue-400' : 'text-white'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 mr-2 ${videoLikedByUser[video.id] ? 'fill-current' : ''}`} />
                        {video.likes} Curtidas
                      </Button>
                      <span className="text-gray-400 text-sm flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        {videoComments[video.id]?.length || 0} comentários
                      </span>
                      <span className="text-gray-400 text-sm flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        {video.views} visualizações
                      </span>
                    </div>
                  </div>

                  {/* Seção de Comentários */}
                  <div className="bg-white/5 rounded-lg p-6 space-y-6">
                    <h4 className="text-xl font-bold text-white flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-blue-400" />
                      Comentários
                    </h4>

                    {/* Adicionar Comentário */}
                    <div className="space-y-3">
                      <Label className="text-white">Deixe seu comentário:</Label>
                      <div className="flex gap-3">
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Compartilhe sua opinião sobre este vídeo..."
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                        />
                        <Button
                          onClick={() => handleAddComment(video.id)}
                          className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 h-[100px]"
                        >
                          <Send className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Lista de Comentários */}
                    <div className="space-y-4">
                      {(!videoComments[video.id] || videoComments[video.id].length === 0) ? (
                        <p className="text-gray-400 text-center py-8">
                          Seja o primeiro a comentar neste vídeo!
                        </p>
                      ) : (
                        videoComments[video.id].map((comment) => (
                          <Card key={comment.id} className="bg-white/5 border-white/10">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                  {comment.user_name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-white font-semibold">{comment.user_name}</span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                  </div>
                                  <p className="text-gray-300 mb-3">{comment.comment_text}</p>
                                  <Button
                                    onClick={() => handleLikeComment(video.id, comment.id)}
                                    variant="ghost"
                                    size="sm"
                                    disabled={commentLikedByUser[comment.id]}
                                    className={`text-xs ${
                                      commentLikedByUser[comment.id] ? 'text-blue-400' : 'text-gray-400'
                                    } hover:text-blue-300`}
                                  >
                                    <ThumbsUp className={`w-3 h-3 mr-1 ${
                                      commentLikedByUser[comment.id] ? 'fill-current' : ''
                                    }`} />
                                    {comment.likes > 0 && comment.likes}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {loadingVideos && (
          <Card className="mb-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-purple-500/30">
            <CardContent className="p-8 text-center">
              <p className="text-white text-lg">Carregando vídeos...</p>
            </CardContent>
          </Card>
        )}

        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Bem-vindo, {getUserDisplayName()}!
          </h2>
          <p className="text-xl text-gray-300 mb-6">
            Sua jornada de transformação começa aqui
          </p>
          {!isPro && (
            <Button 
              onClick={onUpgradeToPro}
              size="lg"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg px-8"
            >
              <Crown className="w-5 h-5 mr-2" />
              Assinar PRO - R$ 29,90/mês
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30 hover:border-purple-500/60 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Treinos</h3>
              <p className="text-gray-400 mb-4">
                {isPro ? "Acesso completo a todos os programas" : "1 aula gratuita disponível"}
              </p>
              <Button 
                onClick={handleContentAccess}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isPro ? "Acessar Treinos" : "Ver Prévia"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-blue-500/30 hover:border-blue-500/60 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Nutrição</h3>
              <p className="text-gray-400 mb-4">
                {isPro ? "50+ cardápios personalizados" : "Dica de receita gratuita"}
              </p>
              <Button 
                onClick={handleContentAccess}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isPro ? "Acessar Cardápios" : "Ver Receita"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30 hover:border-pink-500/60 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sedução</h3>
              <p className="text-gray-400 mb-4">
                {isPro ? "Audiobook completo + técnicas" : "eBook gratuito"}
              </p>
              <Button 
                onClick={handleContentAccess}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                {isPro ? "Acessar Conteúdo" : "Ver Prévia"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border-green-500/30">
          <CardHeader>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Share2 className="w-6 h-6 text-green-400" />
              Indique e Ganhe
            </h3>
            <p className="text-gray-300">
              Compartilhe o Método PDS e ganhe R$30 em créditos a partir da 5ª indicação
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-black/30 rounded-lg p-4">
                <Label className="text-white mb-2 block font-semibold">Seu Link Exclusivo de Indicação:</Label>
                <div className="flex gap-2">
                  <input
                    value={referralLink}
                    readOnly
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm"
                  />
                  <Button
                    onClick={handleCopyReferralLink}
                    className="bg-green-600 hover:bg-green-700 flex-shrink-0"
                  >
                    {referralLinkCopied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Compartilhe este link com seus amigos. Quando eles assinarem o plano PRO, você ganha créditos!
                </p>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Indicações realizadas:</span>
                  <span className="text-2xl font-bold text-white">{referrals}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((referrals / 5) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400">
                  {referrals < 5 
                    ? `Faltam ${5 - referrals} indicações para ganhar R$30 em créditos`
                    : `Você ganhou R$${credits} em créditos! Continue indicando para ganhar mais.`
                  }
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-gray-200 font-semibold">Como funciona:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                  <li>Compartilhe seu link exclusivo com amigos</li>
                  <li>A partir da 5ª indicação que assinar PRO, você ganha R$30</li>
                  <li>A cada 5 novas indicações, ganhe mais R$30</li>
                  <li>Use os créditos para renovar sua assinatura ou sacar</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleShareWhatsApp}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar no WhatsApp
                </Button>
                <Button 
                  onClick={handleCopyReferralLink}
                  variant="outline"
                  className="flex-1 border-green-500 text-green-400 hover:bg-green-500/10"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link
                </Button>
              </div>

              {credits > 0 && (
                <Button 
                  variant="outline"
                  className="w-full border-green-500 text-green-400 hover:bg-green-500/10"
                >
                  Sacar R$ {credits}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-2 border-purple-500/50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Prévias Gratuitas Esgotadas
              </h3>
              <p className="text-gray-300 mb-6">
                Você usou suas {MAX_FREE_PREVIEWS} prévias gratuitas. Assine o plano PRO para ter acesso ilimitado a todo o conteúdo!
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={onUpgradeToPro}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Assinar PRO - R$ 29,90/mês
                </Button>
                <Button 
                  onClick={() => setShowUpgradeModal(false)}
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white"
                >
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2024 Método PDS - Todos os direitos reservados</p>
          <p className="mt-2 text-sm">Transforme seu corpo, mente e vida social</p>
        </div>
      </footer>
    </div>
  )
}
