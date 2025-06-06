"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Calendar, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
}

interface Quarto {
  numero: string
  tipo: string
  preco: string
  status: boolean
}

export default function NovaReservaPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [quartosDisponiveis, setQuartosDisponiveis] = useState<Quarto[]>([])
  const [allQuartos, setAllQuartos] = useState<Quarto[]>([])
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    cliente_id: "",
    quarto_numero: "",
    data_check_in: "",
    data_check_out: "",
  })

  useEffect(() => {
    const savedData = localStorage.getItem("hotelData")
    if (savedData) {
      const data = JSON.parse(savedData)
      setClientes(data.clientes || [])
      setAllQuartos(data.quartos || [])
    }

    // Definir datas padrão
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date()
    dayAfter.setDate(dayAfter.getDate() + 2)

    setFormData((prev) => ({
      ...prev,
      data_check_in: tomorrow.toISOString().split("T")[0],
      data_check_out: dayAfter.toISOString().split("T")[0],
    }))
  }, [])

  useEffect(() => {
    updateAvailableRooms()
  }, [formData.data_check_in, formData.data_check_out, allQuartos])

  const updateAvailableRooms = () => {
    if (!formData.data_check_in || !formData.data_check_out) {
      setQuartosDisponiveis([])
      return
    }

    const checkIn = new Date(formData.data_check_in)
    const checkOut = new Date(formData.data_check_out)

    if (checkOut <= checkIn) {
      setQuartosDisponiveis([])
      return
    }

    const savedData = localStorage.getItem("hotelData")
    if (!savedData) {
      setQuartosDisponiveis(allQuartos.filter((q) => q.status))
      return
    }

    const data = JSON.parse(savedData)
    const reservas = data.reservas || []

    const quartosEmServico = allQuartos.filter((q) => q.status)
    const disponiveis = quartosEmServico.filter((quarto) => {
      const conflito = reservas.some((reserva: any) => {
        if (reserva.quarto_numero !== quarto.numero || reserva.status === "Cancelada") {
          return false
        }

        const reservaCheckIn = new Date(reserva.data_check_in)
        const reservaCheckOut = new Date(reserva.data_check_out)

        return checkIn < reservaCheckOut && checkOut > reservaCheckIn
      })

      return !conflito
    })

    setQuartosDisponiveis(disponiveis)
  }

  const validateDates = () => {
    const checkIn = new Date(formData.data_check_in)
    const checkOut = new Date(formData.data_check_out)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkIn < today) {
      return "Data de check-in não pode ser no passado."
    }

    if (checkOut <= checkIn) {
      return "Data de check-out deve ser após o check-in."
    }

    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.cliente_id || !formData.quarto_numero || !formData.data_check_in || !formData.data_check_out) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const dateError = validateDates()
    if (dateError) {
      toast({
        title: "Erro",
        description: dateError,
        variant: "destructive",
      })
      return
    }

    const quarto = allQuartos.find((q) => q.numero === formData.quarto_numero)
    if (!quarto || !quarto.status) {
      toast({
        title: "Erro",
        description: "Quarto selecionado está fora de serviço.",
        variant: "destructive",
      })
      return
    }

    // Verificar disponibilidade novamente
    if (!quartosDisponiveis.some((q) => q.numero === formData.quarto_numero)) {
      toast({
        title: "Erro",
        description: "Quarto não está disponível para as datas selecionadas.",
        variant: "destructive",
      })
      return
    }

    const novaReserva = {
      id: Date.now().toString(),
      cliente_id: formData.cliente_id,
      quarto_numero: formData.quarto_numero,
      data_check_in: formData.data_check_in,
      data_check_out: formData.data_check_out,
      status: "Confirmada",
      pago: false,
    }

    const savedData = localStorage.getItem("hotelData")
    const data = savedData ? JSON.parse(savedData) : {}
    data.reservas = [...(data.reservas || []), novaReserva]
    localStorage.setItem("hotelData", JSON.stringify(data))

    toast({
      title: "Sucesso",
      description: "Reserva criada com sucesso!",
    })

    router.push("/reservas")
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
            <Calendar className="h-8 w-8 text-orange-600" />
            Nova Reserva
          </h1>
          <p className="text-gray-600 mt-1">Criar uma nova reserva para um cliente</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Reserva</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="cliente">Cliente</Label>
                <Select
                  value={formData.cliente_id}
                  onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome} - {cliente.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {clientes.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">Nenhum cliente cadastrado. Cadastre um cliente primeiro.</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="check_in">Data de Check-in</Label>
                  <Input
                    id="check_in"
                    type="date"
                    value={formData.data_check_in}
                    onChange={(e) => setFormData({ ...formData, data_check_in: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="check_out">Data de Check-out</Label>
                  <Input
                    id="check_out"
                    type="date"
                    value={formData.data_check_out}
                    onChange={(e) => setFormData({ ...formData, data_check_out: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="quarto">Quarto Disponível</Label>
                <Select
                  value={formData.quarto_numero}
                  onValueChange={(value) => setFormData({ ...formData, quarto_numero: value })}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        quartosDisponiveis.length === 0
                          ? "Nenhum quarto disponível para as datas selecionadas"
                          : "Selecione um quarto"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {quartosDisponiveis.map((quarto) => (
                      <SelectItem key={quarto.numero} value={quarto.numero}>
                        Nº {quarto.numero} - {quarto.tipo} (R$ {quarto.preco})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  {quartosDisponiveis.length} quarto(s) disponível(is) para as datas selecionadas
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={quartosDisponiveis.length === 0}>
                  Confirmar Reserva
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
