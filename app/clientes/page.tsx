"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Users } from "lucide-react"

interface Cliente {
  id: string
  nome: string
  telefone: string
  email: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
  })

  useEffect(() => {
    const savedData = localStorage.getItem("hotelData")
    if (savedData) {
      const data = JSON.parse(savedData)
      setClientes(data.clientes || [])
    }
  }, [])

  const saveToStorage = (newClientes: Cliente[]) => {
    const savedData = localStorage.getItem("hotelData")
    const data = savedData ? JSON.parse(savedData) : {}
    data.clientes = newClientes
    localStorage.setItem("hotelData", JSON.stringify(data))
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.telefone || !formData.email) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    if (!validateEmail(formData.email)) {
      toast({
        title: "Erro",
        description: "Formato de e-mail inválido.",
        variant: "destructive",
      })
      return
    }

    // Verificar se email já existe (exceto se estiver editando o mesmo cliente)
    const emailExists = clientes.some(
      (c) => c.email === formData.email && (!editingCliente || c.id !== editingCliente.id),
    )

    if (emailExists) {
      toast({
        title: "Erro",
        description: "E-mail já cadastrado.",
        variant: "destructive",
      })
      return
    }

    let newClientes
    if (editingCliente) {
      newClientes = clientes.map((c) => (c.id === editingCliente.id ? { ...editingCliente, ...formData } : c))
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso!",
      })
    } else {
      const novoCliente: Cliente = {
        id: Date.now().toString(),
        ...formData,
      }
      newClientes = [...clientes, novoCliente]
      toast({
        title: "Sucesso",
        description: "Cliente cadastrado com sucesso!",
      })
    }

    setClientes(newClientes)
    saveToStorage(newClientes)
    setIsDialogOpen(false)
    setEditingCliente(null)
    setFormData({ nome: "", telefone: "", email: "" })
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setFormData({
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (clienteId: string) => {
    // Verificar se há reservas ativas para este cliente
    const savedData = localStorage.getItem("hotelData")
    if (savedData) {
      const data = JSON.parse(savedData)
      const reservasAtivas = (data.reservas || []).filter(
        (r: any) => r.cliente_id === clienteId && r.status !== "Cancelada",
      )

      if (reservasAtivas.length > 0) {
        toast({
          title: "Erro",
          description: "Não é possível excluir um cliente com reservas ativas.",
          variant: "destructive",
        })
        return
      }
    }

    const newClientes = clientes.filter((c) => c.id !== clienteId)
    setClientes(newClientes)
    saveToStorage(newClientes)
    toast({
      title: "Sucesso",
      description: "Cliente excluído com sucesso!",
    })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-green-600" />
            Gerenciar Clientes
          </h1>
          <p className="text-gray-600 mt-1">Cadastre e gerencie os clientes do hotel</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCliente(null)
                setFormData({ nome: "", telefone: "", email: "" })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCliente ? "Editar Cliente" : "Adicionar Novo Cliente"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Digite o nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="exemplo@email.com"
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{editingCliente ? "Atualizar" : "Cadastrar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes ({clientes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>{cliente.telefone}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(cliente)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(cliente.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {clientes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum cliente cadastrado. Clique em "Adicionar Cliente" para começar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
