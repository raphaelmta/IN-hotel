"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Plus, CreditCard, X } from "lucide-react"
import Link from "next/link"

interface Reserva {
  id: string
  cliente_id: string
  cliente_nome: string
  quarto_numero: string
  data_check_in: string
  data_check_out: string
  status: string
  pago: boolean
}

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadReservas()
  }, [])

  const loadReservas = () => {
    const savedData = localStorage.getItem("hotelData")
    if (savedData) {
      const data = JSON.parse(savedData)
      const reservasData = data.reservas || []
      const clientesData = data.clientes || []

      // Enriquecer reservas com dados do cliente
      const reservasEnriquecidas = reservasData.map((r: any) => {
        const cliente = clientesData.find((c: any) => c.id === r.cliente_id)
        return {
          ...r,
          cliente_nome: cliente ? cliente.nome : "Cliente não encontrado",
        }
      })

      setReservas(reservasEnriquecidas)
    }
  }

  const saveToStorage = (newReservas: any[]) => {
    const savedData = localStorage.getItem("hotelData")
    const data = savedData ? JSON.parse(savedData) : {}
    data.reservas = newReservas
    localStorage.setItem("hotelData", JSON.stringify(data))
  }

  const handleCancelReserva = (reservaId: string) => {
    const savedData = localStorage.getItem("hotelData")
    if (savedData) {
      const data = JSON.parse(savedData)
      const newReservas = data.reservas.map((r: any) => (r.id === reservaId ? { ...r, status: "Cancelada" } : r))
      saveToStorage(newReservas)
      loadReservas()
      toast({
        title: "Sucesso",
        description: "Reserva cancelada com sucesso!",
      })
    }
  }

  const handleTogglePayment = (reservaId: string, currentPago: boolean) => {
    const savedData = localStorage.getItem("hotelData")
    if (savedData) {
      const data = JSON.parse(savedData)
      const reserva = data.reservas.find((r: any) => r.id === reservaId)

      if (reserva && reserva.status === "Cancelada" && !currentPago) {
        toast({
          title: "Erro",
          description: "Não é possível marcar uma reserva cancelada como paga.",
          variant: "destructive",
        })
        return
      }

      const newReservas = data.reservas.map((r: any) => (r.id === reservaId ? { ...r, pago: !currentPago } : r))
      saveToStorage(newReservas)
      loadReservas()
      toast({
        title: "Sucesso",
        description: `Reserva marcada como ${!currentPago ? "paga" : "não paga"}!`,
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmada":
        return "default"
      case "Cancelada":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-orange-600" />
            Gerenciar Reservas
          </h1>
          <p className="text-gray-600 mt-1">Visualize e gerencie todas as reservas</p>
        </div>

        <Link href="/reservas/nova">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Reserva
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Reservas ({reservas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Quarto</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservas.map((reserva) => (
                <TableRow key={reserva.id}>
                  <TableCell className="font-mono text-sm">{reserva.id.substring(0, 8)}...</TableCell>
                  <TableCell className="font-medium">{reserva.cliente_nome}</TableCell>
                  <TableCell>{reserva.quarto_numero}</TableCell>
                  <TableCell>{formatDate(reserva.data_check_in)}</TableCell>
                  <TableCell>{formatDate(reserva.data_check_out)}</TableCell>
                  <TableCell>
                    <Badge variant={reserva.pago ? "default" : "destructive"}>{reserva.pago ? "Sim" : "Não"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(reserva.status)}>{reserva.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePayment(reserva.id, reserva.pago)}
                        disabled={reserva.status === "Cancelada" && !reserva.pago}
                      >
                        {reserva.pago ? <X className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelReserva(reserva.id)}
                        disabled={reserva.status === "Cancelada"}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {reservas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma reserva encontrada. Clique em "Nova Reserva" para começar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
