"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Bed } from "lucide-react"

interface Quarto {
  numero: string
  tipo: string
  preco: string
  status: boolean
}

export default function QuartosPage() {
  const [quartos, setQuartos] = useState<Quarto[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingQuarto, setEditingQuarto] = useState<Quarto | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    numero: "",
    tipo: "",
    preco: "",
  })

  useEffect(() => {
    const savedData = localStorage.getItem("hotelData")
    if (savedData) {
      const data = JSON.parse(savedData)
      setQuartos(data.quartos || [])
    }
  }, [])

  const saveToStorage = (newQuartos: Quarto[]) => {
    const savedData = localStorage.getItem("hotelData")
    const data = savedData ? JSON.parse(savedData) : {}
    data.quartos = newQuartos
    localStorage.setItem("hotelData", JSON.stringify(data))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.numero || !formData.tipo || !formData.preco) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const preco = Number.parseFloat(formData.preco.replace(",", "."))
    if (isNaN(preco)) {
      toast({
        title: "Erro",
        description: "Preço inválido.",
        variant: "destructive",
      })
      return
    }

    if (!editingQuarto && quartos.some((q) => q.numero === formData.numero)) {
      toast({
        title: "Erro",
        description: "Quarto já cadastrado.",
        variant: "destructive",
      })
      return
    }

    const novoQuarto: Quarto = {
      numero: formData.numero,
      tipo: formData.tipo,
      preco: preco.toFixed(2),
      status: true,
    }

    let newQuartos
    if (editingQuarto) {
      newQuartos = quartos.map((q) => (q.numero === editingQuarto.numero ? novoQuarto : q))
      toast({
        title: "Sucesso",
        description: "Quarto atualizado com sucesso!",
      })
    } else {
      newQuartos = [...quartos, novoQuarto]
      toast({
        title: "Sucesso",
        description: "Quarto cadastrado com sucesso!",
      })
    }

    setQuartos(newQuartos)
    saveToStorage(newQuartos)
    setIsDialogOpen(false)
    setEditingQuarto(null)
    setFormData({ numero: "", tipo: "", preco: "" })
  }

  const handleEdit = (quarto: Quarto) => {
    setEditingQuarto(quarto)
    setFormData({
      numero: quarto.numero,
      tipo: quarto.tipo,
      preco: quarto.preco,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (numero: string) => {
    // Verificar se há reservas ativas para este quarto
    const savedData = localStorage.getItem("hotelData")
    if (savedData) {
      const data = JSON.parse(savedData)
      const reservasAtivas = (data.reservas || []).filter(
        (r: any) => r.quarto_numero === numero && r.status !== "Cancelada",
      )

      if (reservasAtivas.length > 0) {
        toast({
          title: "Erro",
          description: "Não é possível excluir um quarto com reservas ativas.",
          variant: "destructive",
        })
        return
      }
    }

    const newQuartos = quartos.filter((q) => q.numero !== numero)
    setQuartos(newQuartos)
    saveToStorage(newQuartos)
    toast({
      title: "Sucesso",
      description: "Quarto excluído com sucesso!",
    })
  }

  const toggleStatus = (numero: string) => {
    const newQuartos = quartos.map((q) => (q.numero === numero ? { ...q, status: !q.status } : q))
    setQuartos(newQuartos)
    saveToStorage(newQuartos)
    toast({
      title: "Sucesso",
      description: "Status do quarto atualizado!",
    })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bed className="h-8 w-8 text-blue-600" />
            Gerenciar Quartos
          </h1>
          <p className="text-gray-600 mt-1">Cadastre e gerencie os quartos do hotel</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingQuarto(null)
                setFormData({ numero: "", tipo: "", preco: "" })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Quarto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingQuarto ? "Editar Quarto" : "Adicionar Novo Quarto"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="numero">Número do Quarto</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="Ex: 101"
                  disabled={!!editingQuarto}
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solteiro">Solteiro</SelectItem>
                    <SelectItem value="Casal">Casal</SelectItem>
                    <SelectItem value="Luxo">Luxo</SelectItem>
                    <SelectItem value="Suíte">Suíte</SelectItem>
                    <SelectItem value="Família">Família</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="preco">Preço da Diária (R$)</Label>
                <Input
                  id="preco"
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  placeholder="Ex: 150.00"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{editingQuarto ? "Atualizar" : "Cadastrar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Quartos ({quartos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quartos.map((quarto) => (
                <TableRow key={quarto.numero}>
                  <TableCell className="font-medium">{quarto.numero}</TableCell>
                  <TableCell>{quarto.tipo}</TableCell>
                  <TableCell>R$ {quarto.preco}</TableCell>
                  <TableCell>
                    <Badge
                      variant={quarto.status ? "default" : "destructive"}
                      className="cursor-pointer"
                      onClick={() => toggleStatus(quarto.numero)}
                    >
                      {quarto.status ? "Em Serviço" : "Fora de Serviço"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(quarto)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(quarto.numero)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {quartos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum quarto cadastrado. Clique em "Adicionar Quarto" para começar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
