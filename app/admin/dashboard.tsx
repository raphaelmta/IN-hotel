"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Hotel,
  Users,
  Calendar,
  Settings,
  Plus,
  Bed,
  Shield,
  LogOut,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  CreditCard,
  X,
  DollarSign,
  RotateCcw,
  Ban,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { api, type DashboardStats, type Cliente, type Quarto, type Reserva, type HotelInfo } from "@/lib/api"

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "quartos" | "clientes" | "reservas" | "configuracoes">(
    "dashboard",
  )
  const [stats, setStats] = useState<DashboardStats>({
    total_quartos: 0,
    quartos_disponiveis: 0,
    total_clientes: 0,
    reservas_ativas: 0,
    total_reservas: 0,
    reservas_pagas: 0,
    reservas_pendentes: 0,
    ocupacao: 0,
  })
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [quartos, setQuartos] = useState<Quarto[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [hotelInfo, setHotelInfo] = useState<HotelInfo>({
    nome: "Infinity Hotel",
    endereco: "Av. do Contorno, 6480 - Savassi, Belo Horizonte",
    telefone: "(31) 3333-4444",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Estados para modais
  const [showModal, setShowModal] = useState<"cliente" | "quarto" | "reserva" | null>(null)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Estados para formulários
  const [clienteForm, setClienteForm] = useState({ nome: "", email: "", telefone: "" })
  const [quartoForm, setQuartoForm] = useState({ numero: "", tipo: "Solteiro", preco: "", status: true })
  const [reservaForm, setReservaForm] = useState({
    cliente_id: "",
    quarto_numero: "",
    data_check_in: "",
    data_check_out: "",
    pago: false,
  })
  const [hotelForm, setHotelForm] = useState(hotelInfo)

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    try {
      setLoading(true)

      if (activeTab === "dashboard") {
        const statsData = await api.getAdminDashboardStats()
        setStats(statsData)
      } else if (activeTab === "clientes") {
        const clientesData = await api.getAdminClientes()
        setClientes(clientesData)
      } else if (activeTab === "quartos") {
        const quartosData = await api.getAdminQuartos()
        setQuartos(quartosData)
      } else if (activeTab === "reservas") {
        const reservasData = await api.getAdminReservas()
        setReservas(reservasData)
      } else if (activeTab === "configuracoes") {
        const hotelData = await api.getAdminHotelInfo()
        setHotelInfo(hotelData)
        setHotelForm(hotelData)
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao carregar dados" })
    } finally {
      setLoading(false)
    }
  }

  const openModal = (type: "cliente" | "quarto" | "reserva", item?: any) => {
    setShowModal(type)
    setEditingItem(item)

    if (type === "cliente") {
      setClienteForm(
        item ? { nome: item.nome, email: item.email, telefone: item.telefone } : { nome: "", email: "", telefone: "" },
      )
    } else if (type === "quarto") {
      setQuartoForm(
        item
          ? { numero: item.numero, tipo: item.tipo, preco: item.preco, status: item.status }
          : { numero: "", tipo: "Solteiro", preco: "", status: true },
      )
    } else if (type === "reserva") {
      setReservaForm(
        item
          ? {
              cliente_id: item.cliente_id,
              quarto_numero: item.quarto_numero,
              data_check_in: item.data_check_in,
              data_check_out: item.data_check_out,
              pago: item.pago,
            }
          : { cliente_id: "", quarto_numero: "", data_check_in: "", data_check_out: "", pago: false },
      )
    }
  }

  const closeModal = () => {
    setShowModal(null)
    setEditingItem(null)
  }

  const handleSubmitCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (editingItem) {
        await api.updateAdminCliente(editingItem.id, clienteForm)
        setMessage({ type: "success", text: "Cliente atualizado com sucesso!" })
      } else {
        await api.createAdminCliente(clienteForm)
        setMessage({ type: "success", text: "Cliente cadastrado com sucesso!" })
      }
      closeModal()
      loadData()
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao salvar cliente" })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitQuarto = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (editingItem) {
        await api.updateAdminQuarto(editingItem.numero, quartoForm)
        setMessage({ type: "success", text: "Quarto atualizado com sucesso!" })
      } else {
        await api.createAdminQuarto(quartoForm)
        setMessage({ type: "success", text: "Quarto cadastrado com sucesso!" })
      }
      closeModal()
      loadData()
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao salvar quarto" })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReserva = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await api.createAdminReserva(reservaForm)
      setMessage({ type: "success", text: "Reserva criada com sucesso!" })
      closeModal()
      loadData()
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao criar reserva" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCliente = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return

    try {
      setLoading(true)
      await api.deleteAdminCliente(id)
      setMessage({ type: "success", text: "Cliente excluído com sucesso!" })
      loadData()
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao excluir cliente" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuarto = async (numero: string) => {
    if (!confirm("Tem certeza que deseja excluir este quarto?")) return

    try {
      setLoading(true)
      await api.deleteAdminQuarto(numero)
      setMessage({ type: "success", text: "Quarto excluído com sucesso!" })
      loadData()
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao excluir quarto" })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelReserva = async (id: string) => {
    if (!confirm("Tem certeza que deseja cancelar esta reserva?")) return

    try {
      setLoading(true)
      await api.cancelAdminReserva(id)
      setMessage({ type: "success", text: "Reserva cancelada com sucesso!" })
      loadData()
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao cancelar reserva" })
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePayment = async (id: string) => {
    try {
      setLoading(true)
      await api.toggleAdminPayment(id)
      setMessage({ type: "success", text: "Status de pagamento atualizado!" })
      loadData()
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao atualizar pagamento" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReserva = async (id: string) => {
    if (
      !confirm(
        "⚠️ ATENÇÃO: Esta ação irá excluir permanentemente a reserva do sistema. Esta ação não pode ser desfeita. Tem certeza?",
      )
    )
      return

    try {
      setLoading(true)
      await api.deleteAdminReserva(id)
      setMessage({ type: "success", text: "Reserva excluída permanentemente do sistema!" })
      loadData()
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao excluir reserva" })
    } finally {
      setLoading(false)
    }
  }

  const handleReactivateReserva = async (id: string) => {
    if (!confirm("Tem certeza que deseja reativar esta reserva?")) return

    try {
      setLoading(true)
      await api.reactivateAdminReserva(id)
      setMessage({ type: "success", text: "Reserva reativada com sucesso!" })
      loadData()
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao reativar reserva" })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateHotelInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await api.updateAdminHotelInfo(hotelForm)
      setMessage({ type: "success", text: "Informações do hotel atualizadas com sucesso!" })
      setHotelInfo(hotelForm)
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao atualizar informações" })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmada":
        return "bg-green-100 text-green-800"
      case "Cancelada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Infinity Hotel
                </span>
                <div className="text-xs text-gray-500">Painel Administrativo</div>
              </div>
            </Link>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: Hotel },
              { id: "quartos", label: "Quartos", icon: Bed },
              { id: "clientes", label: "Clientes", icon: Users },
              { id: "reservas", label: "Reservas", icon: Calendar },
              { id: "configuracoes", label: "Configurações", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                    activeTab === tab.id ? "bg-purple-600 text-white" : "bg-white text-gray-600 hover:bg-purple-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Administrativo</h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Quartos</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total_quartos}</p>
                      <p className="text-xs text-green-600">{stats.quartos_disponiveis} disponíveis</p>
                    </div>
                    <Bed className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Clientes</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total_clientes}</p>
                      <p className="text-xs text-gray-500">Cadastrados</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Reservas Ativas</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.reservas_ativas}</p>
                      <p className="text-xs text-gray-500">{stats.total_reservas} total</p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ocupação</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.ocupacao}%</p>
                      <p className="text-xs text-gray-500">Taxa atual</p>
                    </div>
                    <Hotel className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Financial Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Reservas Pagas</p>
                      <p className="text-3xl font-bold text-green-600">{stats.reservas_pagas || 0}</p>
                      <p className="text-xs text-gray-500">Pagamentos confirmados</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pagamentos Pendentes</p>
                      <p className="text-3xl font-bold text-red-600">{stats.reservas_pendentes || 0}</p>
                      <p className="text-xs text-gray-500">Aguardando pagamento</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quartos */}
          {activeTab === "quartos" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Gerenciar Quartos</h2>
                <button
                  onClick={() => openModal("quarto")}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Quarto
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg shadow">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {quartos.map((quarto) => (
                      <tr key={quarto.numero}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{quarto.numero}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{quarto.tipo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">R$ {quarto.preco}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              quarto.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {quarto.status ? "Em Serviço" : "Fora de Serviço"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal("quarto", quarto)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuarto(quarto.numero)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Clientes */}
          {activeTab === "clientes" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Gerenciar Clientes</h2>
                <button
                  onClick={() => openModal("cliente")}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Cliente
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg shadow">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cadastrado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {clientes.map((cliente) => (
                      <tr key={cliente.id}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{cliente.nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{cliente.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{cliente.telefone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(cliente.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal("cliente", cliente)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCliente(cliente.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reservas */}
          {activeTab === "reservas" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Gerenciar Reservas</h2>
                <button
                  onClick={() => openModal("reserva")}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nova Reserva
                </button>
              </div>

              <div className="space-y-4">
                {reservas.map((reserva) => (
                  <div key={reserva.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{reserva.cliente_nome}</h3>
                        <p className="text-gray-600">
                          Quarto {reserva.quarto_numero} - {reserva.quarto_tipo}
                        </p>
                        <p className="text-sm text-gray-500">Reserva #{reserva.id}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(reserva.status)}`}
                        >
                          {reserva.status}
                        </span>
                        <div className="mt-2 space-x-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              reserva.pago ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {reserva.pago ? "Pago" : "Pendente"}
                          </span>
                          {reserva.origem && (
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                              {reserva.origem === "cliente" ? "Online" : "Admin"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Check-in:</span>
                        <p className="font-medium">{new Date(reserva.data_check_in).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Check-out:</span>
                        <p className="font-medium">{new Date(reserva.data_check_out).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Preço:</span>
                        <p className="font-medium text-green-600">R$ {reserva.quarto_preco}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Criada em:</span>
                        <p className="font-medium">{new Date(reserva.created_at).toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {/* Botão de Pagamento */}
                      <button
                        onClick={() => handleTogglePayment(reserva.id)}
                        disabled={reserva.status === "Cancelada" && !reserva.pago}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                          reserva.pago
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            : "bg-green-100 text-green-800 hover:bg-green-200"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <CreditCard className="h-4 w-4" />
                        {reserva.pago ? "Marcar como Não Pago" : "Marcar como Pago"}
                      </button>

                      {/* Botão de Cancelar/Reativar */}
                      {reserva.status === "Cancelada" ? (
                        <button
                          onClick={() => handleReactivateReserva(reserva.id)}
                          className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 text-sm font-medium flex items-center gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reativar Reserva
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCancelReserva(reserva.id)}
                          className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 text-sm font-medium flex items-center gap-2"
                        >
                          <Ban className="h-4 w-4" />
                          Cancelar Reserva
                        </button>
                      )}

                      {/* Botão de Excluir Permanentemente */}
                      <button
                        onClick={() => handleDeleteReserva(reserva.id)}
                        className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 text-sm font-medium flex items-center gap-2"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Excluir Permanentemente
                      </button>
                    </div>

                    {/* Timestamps adicionais */}
                    {(reserva.cancelled_at || reserva.paid_at || reserva.reactivated_at) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
                          {reserva.paid_at && (
                            <div>
                              <span className="font-medium">Pago em:</span>
                              <p>{new Date(reserva.paid_at).toLocaleString("pt-BR")}</p>
                            </div>
                          )}
                          {reserva.cancelled_at && (
                            <div>
                              <span className="font-medium">Cancelado em:</span>
                              <p>{new Date(reserva.cancelled_at).toLocaleString("pt-BR")}</p>
                            </div>
                          )}
                          {reserva.reactivated_at && (
                            <div>
                              <span className="font-medium">Reativado em:</span>
                              <p>{new Date(reserva.reactivated_at).toLocaleString("pt-BR")}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {reservas.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma reserva encontrada</p>
                </div>
              )}
            </div>
          )}

          {/* Configurações */}
          {activeTab === "configuracoes" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Configurações do Hotel</h2>

              <form onSubmit={handleUpdateHotelInfo} className="max-w-md space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Hotel</label>
                  <input
                    type="text"
                    value={hotelForm.nome}
                    onChange={(e) => setHotelForm((prev) => ({ ...prev, nome: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                  <input
                    type="text"
                    value={hotelForm.endereco}
                    onChange={(e) => setHotelForm((prev) => ({ ...prev, endereco: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={hotelForm.telefone}
                    onChange={(e) => setHotelForm((prev) => ({ ...prev, telefone: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                >
                  {loading ? "Salvando..." : "Salvar Configurações"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingItem ? "Editar" : "Adicionar"}{" "}
                {showModal === "cliente" ? "Cliente" : showModal === "quarto" ? "Quarto" : "Reserva"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {showModal === "cliente" && (
              <form onSubmit={handleSubmitCliente} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input
                    type="text"
                    value={clienteForm.nome}
                    onChange={(e) => setClienteForm((prev) => ({ ...prev, nome: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={clienteForm.email}
                    onChange={(e) => setClienteForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={clienteForm.telefone}
                    onChange={(e) => setClienteForm((prev) => ({ ...prev, telefone: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </form>
            )}

            {showModal === "quarto" && (
              <form onSubmit={handleSubmitQuarto} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                  <input
                    type="text"
                    value={quartoForm.numero}
                    onChange={(e) => setQuartoForm((prev) => ({ ...prev, numero: e.target.value }))}
                    required
                    disabled={!!editingItem}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    value={quartoForm.tipo}
                    onChange={(e) => setQuartoForm((prev) => ({ ...prev, tipo: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Solteiro">Solteiro</option>
                    <option value="Casal">Casal</option>
                    <option value="Luxo">Luxo</option>
                    <option value="Suíte">Suíte</option>
                    <option value="Família">Família</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={quartoForm.preco}
                    onChange={(e) => setQuartoForm((prev) => ({ ...prev, preco: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={quartoForm.status}
                      onChange={(e) => setQuartoForm((prev) => ({ ...prev, status: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Quarto em serviço</span>
                  </label>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </form>
            )}

            {showModal === "reserva" && (
              <form onSubmit={handleSubmitReserva} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                  <select
                    value={reservaForm.cliente_id}
                    onChange={(e) => setReservaForm((prev) => ({ ...prev, cliente_id: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome} - {cliente.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quarto</label>
                  <select
                    value={reservaForm.quarto_numero}
                    onChange={(e) => setReservaForm((prev) => ({ ...prev, quarto_numero: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Selecione um quarto</option>
                    {quartos
                      .filter((q) => q.status)
                      .map((quarto) => (
                        <option key={quarto.numero} value={quarto.numero}>
                          Quarto {quarto.numero} - {quarto.tipo} - R$ {quarto.preco}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de Check-in</label>
                  <input
                    type="date"
                    value={reservaForm.data_check_in}
                    onChange={(e) => setReservaForm((prev) => ({ ...prev, data_check_in: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de Check-out</label>
                  <input
                    type="date"
                    value={reservaForm.data_check_out}
                    onChange={(e) => setReservaForm((prev) => ({ ...prev, data_check_out: e.target.value }))}
                    min={reservaForm.data_check_in || new Date().toISOString().split("T")[0]}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={reservaForm.pago}
                      onChange={(e) => setReservaForm((prev) => ({ ...prev, pago: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Marcar como pago</span>
                  </label>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? "Criando..." : "Criar Reserva"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
