"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  QrCode, 
  Crown, 
  Check, 
  ArrowLeft,
  Shield,
  Zap,
  Copy,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PaymentPage() {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix")
  const [pixCopied, setPixCopied] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  })

  const pixCode = "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-4266141740005204000053039865802BR5913Metodo PDS6009SAO PAULO62070503***63041D3D"
  const pixValue = "29,90"

  const handlePixCopy = () => {
    navigator.clipboard.writeText(pixCode)
    setPixCopied(true)
    setTimeout(() => setPixCopied(false), 3000)
  }

  const handleCardPayment = (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    
    // Simula processamento de pagamento
    setTimeout(() => {
      setProcessing(false)
      alert("Pagamento aprovado! Bem-vindo ao Método PDS PRO 🎉")
      router.push("/")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-300">Pagamento 100% Seguro</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-0 px-4 py-2">
              <Crown className="w-4 h-4 mr-2 inline" />
              Upgrade para PRO
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Finalize Sua Assinatura
            </h1>
            <p className="text-xl text-gray-300">
              Escolha a forma de pagamento e comece sua transformação agora
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2">
              <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Forma de Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPaymentMethod("pix")}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        paymentMethod === "pix"
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-white/20 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <QrCode className={`w-8 h-8 mx-auto mb-3 ${
                        paymentMethod === "pix" ? "text-purple-400" : "text-gray-400"
                      }`} />
                      <div className="text-white font-semibold mb-1">PIX</div>
                      <div className="text-sm text-gray-400">Aprovação instantânea</div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        paymentMethod === "card"
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-white/20 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <CreditCard className={`w-8 h-8 mx-auto mb-3 ${
                        paymentMethod === "card" ? "text-purple-400" : "text-gray-400"
                      }`} />
                      <div className="text-white font-semibold mb-1">Cartão</div>
                      <div className="text-sm text-gray-400">Crédito ou débito</div>
                    </button>
                  </div>

                  {/* PIX Payment */}
                  {paymentMethod === "pix" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="bg-white rounded-lg p-8 text-center">
                        <div className="w-64 h-64 mx-auto bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                          <QrCode className="w-32 h-32 text-gray-600" />
                        </div>
                        <p className="text-gray-600 text-sm mb-4">
                          Escaneie o QR Code com o app do seu banco
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-white">Ou copie o código PIX:</Label>
                        <div className="flex gap-2">
                          <Input
                            value={pixCode}
                            readOnly
                            className="bg-white/10 border-white/20 text-white font-mono text-sm"
                          />
                          <Button
                            onClick={handlePixCopy}
                            className="bg-purple-600 hover:bg-purple-700 flex-shrink-0"
                          >
                            {pixCopied ? (
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
                      </div>

                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                        <p className="text-blue-300 text-sm">
                          ℹ️ Após o pagamento, seu acesso PRO será liberado automaticamente em até 2 minutos.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Card Payment */}
                  {paymentMethod === "card" && (
                    <form onSubmit={handleCardPayment} className="space-y-4 animate-in fade-in duration-300">
                      <div>
                        <Label htmlFor="cardNumber" className="text-white mb-2 block">
                          Número do Cartão
                        </Label>
                        <Input
                          id="cardNumber"
                          placeholder="0000 0000 0000 0000"
                          value={cardData.number}
                          onChange={(e) => setCardData({...cardData, number: e.target.value})}
                          maxLength={19}
                          required
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardName" className="text-white mb-2 block">
                          Nome no Cartão
                        </Label>
                        <Input
                          id="cardName"
                          placeholder="NOME COMO ESTÁ NO CARTÃO"
                          value={cardData.name}
                          onChange={(e) => setCardData({...cardData, name: e.target.value.toUpperCase()})}
                          required
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cardExpiry" className="text-white mb-2 block">
                            Validade
                          </Label>
                          <Input
                            id="cardExpiry"
                            placeholder="MM/AA"
                            value={cardData.expiry}
                            onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                            maxLength={5}
                            required
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>

                        <div>
                          <Label htmlFor="cardCvv" className="text-white mb-2 block">
                            CVV
                          </Label>
                          <Input
                            id="cardCvv"
                            placeholder="000"
                            type="password"
                            value={cardData.cvv}
                            onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                            maxLength={4}
                            required
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 text-lg"
                      >
                        {processing ? (
                          <>Processando...</>
                        ) : (
                          <>
                            <Zap className="w-5 h-5 mr-2" />
                            Confirmar Pagamento - R$ {pixValue}
                          </>
                        )}
                      </Button>

                      <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                        <Shield className="w-4 h-4" />
                        <span>Seus dados estão protegidos com criptografia SSL</span>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-2 border-purple-500/50 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <Crown className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <div className="text-white font-bold">Plano PRO</div>
                        <div className="text-sm text-gray-300">Assinatura Mensal</div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Programas completos de treino</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>50+ cardápios personalizados</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Audiobook de sedução</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Grupo VIP no WhatsApp</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Lives exclusivas mensais</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Suporte prioritário 24/7</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Subtotal</span>
                      <span className="text-white">R$ {pixValue}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-300">Desconto</span>
                      <span className="text-green-400">R$ 0,00</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-white">R$ {pixValue}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Renovação automática mensal. Cancele quando quiser.
                    </p>
                  </div>

                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-400 text-sm font-semibold mb-1">
                      <Shield className="w-4 h-4" />
                      Garantia de 7 dias
                    </div>
                    <p className="text-xs text-gray-300">
                      Não gostou? Devolvemos 100% do seu dinheiro em até 7 dias.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
