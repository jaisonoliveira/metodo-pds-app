"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Lock, 
  Upload, 
  Video, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Plus,
  Eye,
  EyeOff,
  LogOut,
  Save,
  X,
  Download,
  ExternalLink,
  CheckCircle2,
  Dumbbell,
  Apple,
  Heart,
  Music,
  Bell,
  Play,
  Key,
  Users,
  TrendingUp,
  DollarSign,
  UserCheck,
  MessageCircle,
  BarChart3
} from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { FeedbackViewer } from "@/components/admin/FeedbackViewer"
import { PollManager } from "@/components/admin/PollManager"
import { NotificationManager } from "@/components/admin/NotificationManager"

// Senha padrão inicial
let ADMIN_PASSWORD = "admin123"
const SUPER_ADMIN_EMAIL = "jaison_oliveira147@hotmail.com"

type ContentType = "video" | "pdf" | "image" | "audio"
type CategoryType = "treino" | "dieta" | "seducao" | "avisos" | "indicacoes" | "whatsapp" | "feedbacks" | "enquetes" | "notificacoes"

type TreinoSubcategory = "peito" | "costas" | "pernas" | "ombros" | "bracos" | "abdomen" | "cardio" | "funcional"
type DietaSubcategory = "receitas" | "dicas-nutricionais" | "cardapios" | "suplementacao" | "dietas-especificas"
type SeducaoSubcategory = "linguagem-corporal" | "comunicacao" | "confianca" | "estilo" | "relacionamentos"
type AvisosSubcategory = "boas-vindas" | "novos-conteudos" | "atualizacoes" | "avisos-gerais"

interface Content {
  id: string
  type: ContentType
  title: string
  description: string
  url: string
  fileName?: string
  fileSize?: string
  category: CategoryType
  subcategory: TreinoSubcategory | DietaSubcategory | SeducaoSubcategory | AvisosSubcategory
  isPro: boolean
  createdAt: string
}

interface Referral {
  id: string
  referrerEmail: string
  referrerName: string
  referredEmail: string
  status: "pending" | "registered" | "pro_activated"
  createdAt: string
  activatedAt?: string
}

interface UserContact {
  id: string
  name: string
  email: string
  whatsapp: string | null
  createdAt: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<CategoryType>("avisos")
  const [userEmail, setUserEmail] = useState<string>("")
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordChangeError, setPasswordChangeError] = useState("")
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false)

  const [referrals, setReferrals] = useState<Referral[]>([])
  const [userContacts, setUserContacts] = useState<UserContact[]>([])
  const [contents, setContents] = useState<Content[]>([])

  const [showForm, setShowForm] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [formData, setFormData] = useState({
    type: "video" as ContentType,
    title: "",
    description: "",
    url: "",
    fileName: "",
    fileSize: "",
    category: "avisos" as CategoryType,
    subcategory: "boas-vindas" as TreinoSubcategory | DietaSubcategory | SeducaoSubcategory | AvisosSubcategory,
    isPro: false
  })

  // Carregar senha salva do localStorage ao iniciar
  useEffect(() => {
    const savedPassword = localStorage.getItem("admin_password")
    if (savedPassword) {
      ADMIN_PASSWORD = savedPassword
    }
  }, [])

  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const user = await getCurrentUser()
        if (user?.email) {
          setUserEmail(user.email)
          setIsSuperAdmin(user.email === SUPER_ADMIN_EMAIL)
        }
      } catch (error) {
        console.error("Erro ao verificar usuário:", error)
      }
    }

    if (isAuthenticated) {
      checkSuperAdmin()
      loadUserContacts()
    }
  }, [isAuthenticated])

  const loadUserContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, whatsapp, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        // Buscar emails dos usuários
        const userIds = data.map(profile => profile.id)
        const { data: authData } = await supabase.auth.admin.listUsers()
        
        const contacts: UserContact[] = data.map(profile => {
          const authUser = authData?.users.find(u => u.id === profile.id)
          return {
            id: profile.id,
            name: profile.name || 'Sem nome',
            email: authUser?.email || 'Email não encontrado',
            whatsapp: profile.whatsapp,
            createdAt: profile.created_at
          }
        })

        setUserContacts(contacts)
      }
    } catch (error) {
      console.error("Erro ao carregar contatos:", error)
      // Fallback: tentar buscar apenas os profiles
      try {
        const { data, error: fallbackError } = await supabase
          .from('profiles')
          .select('id, name, whatsapp, created_at')
          .order('created_at', { ascending: false })

        if (!fallbackError && data) {
          const contacts: UserContact[] = data.map(profile => ({
            id: profile.id,
            name: profile.name || 'Sem nome',
            email: 'Email protegido',
            whatsapp: profile.whatsapp,
            createdAt: profile.created_at
          }))
          setUserContacts(contacts)
        }
      } catch (fallbackError) {
        console.error("Erro no fallback:", fallbackError)
      }
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError("")
    } else {
      setError("Senha incorreta!")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword("")
    setUserEmail("")
    setIsSuperAdmin(false)
  }

  const handlePasswordChange = () => {
    setPasswordChangeError("")
    setPasswordChangeSuccess(false)

    if (!newPassword || !confirmPassword) {
      setPasswordChangeError("Preencha todos os campos")
      return
    }

    if (newPassword.length < 6) {
      setPasswordChangeError("A senha deve ter no mínimo 6 caracteres")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError("As senhas não coincidem")
      return
    }

    // Salvar nova senha
    ADMIN_PASSWORD = newPassword
    localStorage.setItem("admin_password", newPassword)

    setPasswordChangeSuccess(true)
    setNewPassword("")
    setConfirmPassword("")
    
    setTimeout(() => {
      setShowPasswordChange(false)
      setPasswordChangeSuccess(false)
    }, 2000)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadStatus("uploading")
    
    setTimeout(() => {
      const fileUrl = URL.createObjectURL(file)
      const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2)
      
      setFormData({
        ...formData,
        url: fileUrl,
        fileName: file.name,
        fileSize: `${fileSizeInMB} MB`
      })
      setUploadStatus("success")
      
      setTimeout(() => setUploadStatus("idle"), 3000)
    }, 1500)
  }

  const handleAddContent = () => {
    if (!formData.title || !formData.url) {
      alert("Preencha título e URL/arquivo!")
      return
    }

    const newContent: Content = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString()
    }

    setContents([newContent, ...contents])
    setShowForm(false)
    setFormData({
      type: activeTab === "avisos" ? "video" : activeTab === "treino" ? "video" : activeTab === "dieta" ? "pdf" : activeTab === "seducao" ? "video" : "video",
      title: "",
      description: "",
      url: "",
      fileName: "",
      fileSize: "",
      category: activeTab === "indicacoes" || activeTab === "whatsapp" ? "avisos" : activeTab,
      subcategory: getDefaultSubcategory(activeTab === "indicacoes" || activeTab === "whatsapp" ? "avisos" : activeTab),
      isPro: activeTab !== "avisos" && activeTab !== "indicacoes" && activeTab !== "whatsapp"
    })
    setUploadStatus("idle")
  }

  const handleDeleteContent = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este conteúdo?")) {
      setContents(contents.filter(c => c.id !== id))
    }
  }

  const getDefaultSubcategory = (category: CategoryType): TreinoSubcategory | DietaSubcategory | SeducaoSubcategory | AvisosSubcategory => {
    switch (category) {
      case "treino": return "peito"
      case "dieta": return "receitas"
      case "seducao": return "linguagem-corporal"
      case "avisos": return "boas-vindas"
      case "indicacoes": return "boas-vindas"
      case "whatsapp": return "boas-vindas"
      default: return "boas-vindas"
    }
  }

  const getSubcategoryOptions = (category: CategoryType) => {
    switch (category) {
      case "treino":
        return [
          { value: "peito", label: "💪 Treino de Peito" },
          { value: "costas", label: "🏋️ Treino de Costas" },
          { value: "pernas", label: "🦵 Treino de Pernas" },
          { value: "ombros", label: "💪 Treino de Ombros" },
          { value: "bracos", label: "💪 Treino de Braços" },
          { value: "abdomen", label: "🔥 Treino de Abdômen" },
          { value: "cardio", label: "🏃 Cardio" },
          { value: "funcional", label: "⚡ Funcional" }
        ]
      case "dieta":
        return [
          { value: "receitas", label: "🍳 Receitas" },
          { value: "dicas-nutricionais", label: "💡 Dicas Nutricionais" },
          { value: "cardapios", label: "📋 Cardápios" },
          { value: "suplementacao", label: "💊 Suplementação" },
          { value: "dietas-especificas", label: "🎯 Dietas Específicas" }
        ]
      case "seducao":
        return [
          { value: "linguagem-corporal", label: "🕺 Linguagem Corporal" },
          { value: "comunicacao", label: "💬 Comunicação" },
          { value: "confianca", label: "⚡ Confiança" },
          { value: "estilo", label: "👔 Estilo" },
          { value: "relacionamentos", label: "❤️ Relacionamentos" }
        ]
      case "avisos":
      case "indicacoes":
      case "whatsapp":
        return [
          { value: "boas-vindas", label: "👋 Vídeo de Boas-Vindas" },
          { value: "novos-conteudos", label: "🆕 Novos Conteúdos" },
          { value: "atualizacoes", label: "🔄 Atualizações" },
          { value: "avisos-gerais", label: "📢 Avisos Gerais" }
        ]
      default:
        return [
          { value: "boas-vindas", label: "👋 Vídeo de Boas-Vindas" }
        ]
    }
  }

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case "video": return <Video className="w-5 h-5" />
      case "pdf": return <FileText className="w-5 h-5" />
      case "image": return <ImageIcon className="w-5 h-5" />
      case "audio": return <Music className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: ContentType) => {
    switch (type) {
      case "video": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "pdf": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "image": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "audio": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    }
  }

  const getCategoryIcon = (category: CategoryType) => {
    switch (category) {
      case "treino": return <Dumbbell className="w-5 h-5" />
      case "dieta": return <Apple className="w-5 h-5" />
      case "seducao": return <Heart className="w-5 h-5" />
      case "avisos": return <Bell className="w-5 h-5" />
      case "indicacoes": return <Users className="w-5 h-5" />
      case "whatsapp": return <Users className="w-5 h-5" />
      default: return <Bell className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: CategoryType) => {
    switch (category) {
      case "treino": return "from-purple-500 to-pink-500"
      case "dieta": return "from-green-500 to-emerald-500"
      case "seducao": return "from-red-500 to-pink-500"
      case "avisos": return "from-blue-500 to-cyan-500"
      case "indicacoes": return "from-orange-500 to-yellow-500"
      case "whatsapp": return "from-green-500 to-emerald-500"
      default: return "from-blue-500 to-cyan-500"
    }
  }

  const getTypeLabel = (type: ContentType) => {
    switch (type) {
      case "video": return "Vídeo"
      case "pdf": return "PDF"
      case "image": return "Imagem"
      case "audio": return "Áudio"
    }
  }

  const getStatusBadge = (status: Referral["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">⏳ Pendente</Badge>
      case "registered":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">✓ Registrado</Badge>
      case "pro_activated":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">👑 PRO Ativado</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const filteredContents = contents.filter(c => c.category === activeTab)

  const totalReferrals = referrals.length
  const proActivated = referrals.filter(r => r.status === "pro_activated").length
  const registered = referrals.filter(r => r.status === "registered").length
  const pending = referrals.filter(r => r.status === "pending").length
  const conversionRate = totalReferrals > 0 ? ((proActivated / totalReferrals) * 100).toFixed(1) : "0"

  const referralsByUser = referrals.reduce((acc, ref) => {
    if (!acc[ref.referrerEmail]) {
      acc[ref.referrerEmail] = {
        name: ref.referrerName,
        email: ref.referrerEmail,
        total: 0,
        proActivated: 0,
        registered: 0,
        pending: 0
      }
    }
    acc[ref.referrerEmail].total++
    if (ref.status === "pro_activated") acc[ref.referrerEmail].proActivated++
    if (ref.status === "registered") acc[ref.referrerEmail].registered++
    if (ref.status === "pending") acc[ref.referrerEmail].pending++
    return acc
  }, {} as Record<string, { name: string; email: string; total: number; proActivated: number; registered: number; pending: number }>)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-sm border-white/20">
          <CardHeader>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Painel Admin</h1>
              <p className="text-gray-400">Acesso restrito ao administrador</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-white mb-2 block">
                  Senha de Administrador
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha"
                    className="bg-white/10 border-white/20 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Lock className="w-4 h-4 mr-2" />
                Entrar no Painel
              </Button>

              <p className="text-center text-sm text-gray-400 mt-4">
                🔒 Área protegida - Apenas administradores
              </p>
              <p className="text-center text-xs text-gray-500 mt-2">
                Senha padrão: admin123
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Painel Administrativo</h1>
              <p className="text-xs text-gray-400">Método PDS - Gerenciamento de Conteúdo</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <Button 
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                variant="outline"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              >
                <Key className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
            )}
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showPasswordChange && isSuperAdmin && (
          <Card className="mb-8 bg-black/40 backdrop-blur-sm border-yellow-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Alterar Senha de Administrador</h2>
                    <p className="text-gray-400">Acesso exclusivo para {SUPER_ADMIN_EMAIL}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowPasswordChange(false)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="newPassword" className="text-white mb-2 block">
                  Nova Senha
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha (mínimo 6 caracteres)"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-white mb-2 block">
                  Confirmar Nova Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              {passwordChangeError && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
                  {passwordChangeError}
                </div>
              )}

              {passwordChangeSuccess && (
                <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Senha alterada com sucesso! A nova senha já está ativa.
                </div>
              )}

              <Button 
                onClick={handlePasswordChange}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Nova Senha
              </Button>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  <strong>ℹ️ Importante:</strong> Após alterar a senha, você precisará usar a nova senha na próxima vez que fizer login no painel admin.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total</p>
                  <p className="text-3xl font-bold text-white">{contents.length}</p>
                </div>
                <Upload className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avisos</p>
                  <p className="text-3xl font-bold text-white">
                    {contents.filter(c => c.category === "avisos").length}
                  </p>
                </div>
                <Bell className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Treino</p>
                  <p className="text-3xl font-bold text-white">
                    {contents.filter(c => c.category === "treino").length}
                  </p>
                </div>
                <Dumbbell className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Dieta</p>
                  <p className="text-3xl font-bold text-white">
                    {contents.filter(c => c.category === "dieta").length}
                  </p>
                </div>
                <Apple className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Sedução</p>
                  <p className="text-3xl font-bold text-white">
                    {contents.filter(c => c.category === "seducao").length}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-pink-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">WhatsApp</p>
                  <p className="text-3xl font-bold text-white">{userContacts.length}</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            onClick={() => {
              setActiveTab("avisos")
              setFormData({...formData, type: "video", category: "avisos", subcategory: "boas-vindas", isPro: false})
            }}
            className={`flex items-center gap-2 ${
              activeTab === "avisos" 
                ? "bg-gradient-to-r from-blue-500 to-cyan-500" 
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Bell className="w-4 h-4" />
            Avisos
          </Button>
          <Button
            onClick={() => {
              setActiveTab("treino")
              setFormData({...formData, type: "video", category: "treino", subcategory: "peito", isPro: true})
            }}
            className={`flex items-center gap-2 ${
              activeTab === "treino" 
                ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            Treino
          </Button>
          <Button
            onClick={() => {
              setActiveTab("dieta")
              setFormData({...formData, type: "pdf", category: "dieta", subcategory: "receitas", isPro: true})
            }}
            className={`flex items-center gap-2 ${
              activeTab === "dieta" 
                ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Apple className="w-4 h-4" />
            Dieta
          </Button>
          <Button
            onClick={() => {
              setActiveTab("seducao")
              setFormData({...formData, type: "video", category: "seducao", subcategory: "linguagem-corporal", isPro: true})
            }}
            className={`flex items-center gap-2 ${
              activeTab === "seducao" 
                ? "bg-gradient-to-r from-red-500 to-pink-500" 
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Heart className="w-4 h-4" />
            Sedução
          </Button>
          <Button
            onClick={() => setActiveTab("whatsapp")}
            className={`flex items-center gap-2 ${
              activeTab === "whatsapp" 
                ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            WhatsApp ({userContacts.filter(c => c.whatsapp).length})
          </Button>
          <Button
            onClick={() => setActiveTab("feedbacks")}
            className={`flex items-center gap-2 ${
              activeTab === "feedbacks" 
                ? "bg-gradient-to-r from-blue-500 to-cyan-500" 
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Feedbacks
          </Button>
          <Button
            onClick={() => setActiveTab("enquetes")}
            className={`flex items-center gap-2 ${
              activeTab === "enquetes" 
                ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Enquetes
          </Button>
          <Button
            onClick={() => setActiveTab("notificacoes")}
            className={`flex items-center gap-2 ${
              activeTab === "notificacoes" 
                ? "bg-gradient-to-r from-orange-500 to-red-500" 
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Bell className="w-4 h-4" />
            Notificações
          </Button>
        </div>

        {activeTab === "feedbacks" && isSuperAdmin && (
          <FeedbackViewer />
        )}

        {activeTab === "enquetes" && isSuperAdmin && (
          <PollManager userEmail={userEmail} />
        )}

        {activeTab === "notificacoes" && isSuperAdmin && (
          <NotificationManager userEmail={userEmail} />
        )}

        {activeTab === "whatsapp" ? (
          <div className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-sm border-green-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Users className="w-6 h-6 text-green-400" />
                      Contatos WhatsApp para Remarketing ({userContacts.length})
                    </h2>
                    <p className="text-gray-400">Lista de usuários cadastrados com números de WhatsApp</p>
                  </div>
                  <Button
                    onClick={loadUserContacts}
                    variant="outline"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Atualizar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {userContacts.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Nenhum contato com WhatsApp cadastrado ainda</p>
                    <p className="text-gray-500 text-sm mt-2">Os contatos aparecerão aqui quando os usuários se cadastrarem</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userContacts.map((contact) => (
                      <Card key={contact.id} className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {contact.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white font-semibold">{contact.name}</p>
                                <p className="text-gray-400 text-sm">{contact.email}</p>
                                {contact.whatsapp && (
                                  <p className="text-green-400 text-sm font-mono mt-1">
                                    📱 {contact.whatsapp}
                                  </p>
                                )}
                                {!contact.whatsapp && (
                                  <p className="text-gray-500 text-xs mt-1">
                                    WhatsApp não informado
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                Cadastrado em: {new Date(contact.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                              {contact.whatsapp && (
                                <Button
                                  onClick={() => {
                                    const whatsappNumber = contact.whatsapp?.replace(/\D/g, '')
                                    window.open(`https://wa.me/55${whatsappNumber}`, '_blank')
                                  }}
                                  size="sm"
                                  className="mt-2 bg-green-600 hover:bg-green-700"
                                >
                                  Abrir WhatsApp
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : activeTab !== "feedbacks" && activeTab !== "enquetes" && activeTab !== "notificacoes" && (
          <div className="space-y-6">
            <Card className={`bg-black/40 backdrop-blur-sm border-${getCategoryColor(activeTab).split(' ')[0].replace('from-', '')}/30`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(activeTab)} rounded-lg flex items-center justify-center`}>
                      {getCategoryIcon(activeTab)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {activeTab === "avisos" && "Avisos - Vídeos de Boas-Vindas"}
                        {activeTab === "treino" && "Treinos - Vídeos de Treino"}
                        {activeTab === "dieta" && "Dietas - PDFs de Dietas"}
                        {activeTab === "seducao" && "Sedução - Vídeos de Sedução"}
                      </h2>
                      <p className="text-gray-400">
                        {activeTab === "avisos" && "Adicione vídeos de boas-vindas e avisos importantes"}
                        {activeTab === "treino" && "Adicione vídeos de treinos divididos por grupos musculares"}
                        {activeTab === "dieta" && "Adicione PDFs de dietas, receitas e cardápios"}
                        {activeTab === "seducao" && "Adicione vídeos sobre sedução e relacionamentos"}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowForm(!showForm)}
                    className={`bg-gradient-to-r ${getCategoryColor(activeTab)}`}
                  >
                    {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {showForm ? "Cancelar" : "Adicionar Conteúdo"}
                  </Button>
                </div>
              </CardHeader>

              {showForm && (
                <CardContent className="border-t border-white/10 pt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white mb-2 block">Tipo de Conteúdo</Label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value as ContentType})}
                          className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2"
                        >
                          <option value="video">🎥 Vídeo</option>
                          <option value="pdf">📄 PDF</option>
                          <option value="image">🖼️ Imagem</option>
                          <option value="audio">🎵 Áudio</option>
                        </select>
                      </div>

                      <div>
                        <Label className="text-white mb-2 block">Subcategoria</Label>
                        <select
                          value={formData.subcategory}
                          onChange={(e) => setFormData({...formData, subcategory: e.target.value as any})}
                          className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2"
                        >
                          {getSubcategoryOptions(activeTab).map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Título</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Ex: Treino de Peito Completo"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Descrição</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Descreva o conteúdo..."
                        className="bg-white/10 border-white/20 text-white min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">URL ou Upload de Arquivo</Label>
                      <div className="space-y-2">
                        <Input
                          value={formData.url}
                          onChange={(e) => setFormData({...formData, url: e.target.value})}
                          placeholder="Cole a URL do vídeo/PDF ou faça upload"
                          className="bg-white/10 border-white/20 text-white"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            onChange={handleFileUpload}
                            accept={formData.type === "video" ? "video/*" : formData.type === "pdf" ? ".pdf" : formData.type === "image" ? "image/*" : "audio/*"}
                            className="hidden"
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className="flex-1 cursor-pointer"
                          >
                            <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                              <Upload className="w-4 h-4" />
                              Fazer Upload
                            </div>
                          </label>
                          {uploadStatus === "uploading" && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              Enviando...
                            </Badge>
                          )}
                          {uploadStatus === "success" && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              ✓ Enviado
                            </Badge>
                          )}
                        </div>
                        {formData.fileName && (
                          <p className="text-sm text-gray-400">
                            📎 {formData.fileName} ({formData.fileSize})
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleAddContent}
                      className={`w-full bg-gradient-to-r ${getCategoryColor(activeTab)}`}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Conteúdo
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {filteredContents.length === 0 ? (
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardContent className="py-12 text-center">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Nenhum conteúdo adicionado ainda</p>
                  <p className="text-gray-500 text-sm mt-2">Clique em "Adicionar Conteúdo" para começar</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredContents.map((content) => (
                  <Card key={content.id} className="bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${getTypeColor(content.type)}`}>
                            {getTypeIcon(content.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-white">{content.title}</h3>
                              <Badge className={getTypeColor(content.type)}>
                                {getTypeLabel(content.type)}
                              </Badge>
                              {content.isPro && (
                                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                  👑 PRO
                                </Badge>
                              )}
                            </div>
                            {content.description && (
                              <p className="text-gray-400 text-sm mb-3">{content.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>📅 {formatDate(content.createdAt)}</span>
                              {content.fileName && <span>📎 {content.fileName}</span>}
                              {content.fileSize && <span>💾 {content.fileSize}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => window.open(content.url, '_blank')}
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteContent(content.id)}
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
