"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Settings, Save, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ConfiguracoesPage() {
  const [hotelInfo, setHotelInfo] = useState({
    nome: "Hotel Deluxe Inn",
    endereco: "Rua das Palmeiras, 1000",
    telefone: "(11) 98765-4321",
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const savedData = localStorage.getItem("hotelData")
    if (savedData) {
      const data = JSON.parse(savedData)
      if (data.hotelInfo) {
        setHotelInfo(data.hotelInfo)
      }
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!hotelInfo.nome || !hotelInfo.endereco || !hotelInfo.telefone) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const savedData = localStorage.getItem("hotelData")
    const data = savedData ? JSON.parse(savedData) : {}
    data.hotelInfo = hotelInfo
    localStorage.setItem("hotelData", JSON.stringify(data))

    toast({
      title: "Sucesso",
      description: "Configurações salvas com sucesso!",
    })

    router.push("/")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-gray-600" />
            Configurações do Hotel
          </h1>
          <p className="text-gray-600 mt-1">Gerencie as informações básicas do hotel</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Hotel</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="nome">Nome do Hotel</Label>
                <Input
                  id="nome"
                  value={hotelInfo.nome}
                  onChange={(e) => setHotelInfo({ ...hotelInfo, nome: e.target.value })}
                  placeholder="Digite o nome do hotel"
                />
              </div>

              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={hotelInfo.endereco}
                  onChange={(e) => setHotelInfo({ ...hotelInfo, endereco: e.target.value })}
                  placeholder="Digite o endereço completo"
                />
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={hotelInfo.telefone}
                  onChange={(e) => setHotelInfo({ ...hotelInfo, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
