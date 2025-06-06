"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Hotel, Calendar, User, Mail, Phone, Search, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { api, type Quarto, type HotelInfo, type Reserva } from "@/lib/api"

export default function ClientePage() {
  const [activeTab, setActiveTab] = useState<"quartos" | "cadastro" | "reserva" | "minhas-reservas">("quartos")
  const [quartos, setQuartos] = useState<Quarto[]>([])
  const [quartosDisponiveis, setQuartosDisponiveis] = useState<Quarto[]>([])
  const [hotelInfo, setHotelInfo] = useState<HotelInfo>({
    nome: "Infinity Hotel",
    endereco: "Av. do Contorno, 6480 - Savassi, Belo Horizonte",
    telefone: "(31) 3333-4444",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Estados para formulários
  const [clienteForm, setClienteForm] = useState({
    nome: "",
    email: "",
    telefone: "",
  })

  const [reservaForm, setReservaForm] = useState({
    cliente_email: "",
    quarto_numero: "",
    data_check_in: "",
    data_check_out: "",
  })

  const [consultaEmail, setConsultaEmail] = useState("")
  const [minhasReservas, setMinhasReservas] = useState<Reserva[]>([])

  // Estados para busca de quartos
  const [buscaForm, setBuscaForm] = useState({
    data_check_in: "",
    data_check_out: "",
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [hotelData, quartosData] = await Promise.all([api.getPublicHotelInfo(), api.getQuartosDisponiveisPublic()])
      setHotelInfo(hotelData)
      setQuartos(quartosData)
      setQuartosDisponiveis(quartosData)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    }
  }

  const buscarQuartosDisponiveis = async () => {
    if (!buscaForm.data_check_in || !buscaForm.data_check_out) {
      setMessage({ type: "error", text: "Selecione as datas de check-in e check-out" })
      return
    }

    if (buscaForm.data_check_in >= buscaForm.data_check_out) {
      setMessage({ type: "error", text: "Data de check-out deve ser posterior ao check-in" })
      return
    }

    try {
      setLoading(true)
      const quartosDisponiveis = await api.getQuartosDisponiveisPeriodo(
        buscaForm.data_check_in,
        buscaForm.data_check_out,
      )
      setQuartosDisponiveis(quartosDisponiveis)
      setMessage({
        type: "success",
        text: `${quartosDisponiveis.length} quarto(s) disponível(is) para o período selecionado`,
      })
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao buscar quartos" })
    } finally {
      setLoading(false)
    }
  }

  const cadastrarCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await api.cadastrarClientePublic(clienteForm)
      setMessage({ type: "success", text: response.message })
      setClienteForm({ nome: "", email: "", telefone: "" })
      setActiveTab("reserva")
      setReservaForm((prev) => ({ ...prev, cliente_email: clienteForm.email }))
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao cadastrar cliente" })
    } finally {
      setLoading(false)
    }
  }

  const criarReserva = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await api.criarReservaPublic(reservaForm)
      setMessage({ type: "success", text: response.message })
      setReservaForm({ cliente_email: "", quarto_numero: "", data_check_in: "", data_check_out: "" })
      setActiveTab("minhas-reservas")
      setConsultaEmail(reservaForm.cliente_email)
      await consultarReservas(reservaForm.cliente_email)
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao criar reserva" })
    } finally {
      setLoading(false)
    }
  }

  const consultarReservas = async (email?: string) => {
    const emailConsulta = email || consultaEmail
    if (!emailConsulta) {
      setMessage({ type: "error", text: "Digite seu email para consultar as reservas" })
      return
    }

    try {
      setLoading(true)
      const reservas = await api.getReservasCliente(emailConsulta)
      setMinhasReservas(reservas)
      if (reservas.length === 0) {
        setMessage({ type: "error", text: "Nenhuma reserva encontrada para este email" })
      } else {
        setMessage({ type: "success", text: `${reservas.length} reserva(s) encontrada(s)` })
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao consultar reservas" })
    } finally {
      setLoading(false)
    }
  }

  const selecionarQuarto = (quarto: Quarto) => {
    setReservaForm((prev) => ({ ...prev, quarto_numero: quarto.numero }))
    setActiveTab("reserva")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-green-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-xl">
                <Hotel className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {hotelInfo.nome}
                </span>
                <div className="text-xs text-gray-500">Área do Cliente</div>
              </div>
            </Link>
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
              { id: "quartos", label: "Quartos Disponíveis", icon: Hotel },
              { id: "cadastro", label: "Cadastro", icon: User },
              { id: "reserva", label: "Fazer Reserva", icon: Calendar },
              { id: "minhas-reservas", label: "Minhas Reservas", icon: Search },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                    activeTab === tab.id ? "bg-green-600 text-white" : "bg-white text-gray-600 hover:bg-green-50"
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
          {/* Quartos Disponíveis */}
          {activeTab === "quartos" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Quartos Disponíveis</h2>

              {/* Busca por período */}
              <div className="bg-green-50 p-6 rounded-xl mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultar Disponibilidade</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
                    <input
                      type="date"
                      value={buscaForm.data_check_in}
                      onChange={(e) => setBuscaForm((prev) => ({ ...prev, data_check_in: e.target.value }))}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
                    <input
                      type="date"
                      value={buscaForm.data_check_out}
                      onChange={(e) => setBuscaForm((prev) => ({ ...prev, data_check_out: e.target.value }))}
                      min={buscaForm.data_check_in || new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={buscarQuartosDisponiveis}
                      disabled={loading}
                      className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Search className="h-4 w-4" />
                      {loading ? "Buscando..." : "Buscar"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista de quartos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quartosDisponiveis.map((quarto) => (
                  <div key={quarto.numero} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Quarto {quarto.numero}</h3>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {quarto.tipo}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mb-4">R$ {quarto.preco}</p>
                    <button
                      onClick={() => selecionarQuarto(quarto)}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Reservar Este Quarto
                    </button>
                  </div>
                ))}
              </div>

              {quartosDisponiveis.length === 0 && (
                <div className="text-center py-12">
                  <Hotel className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum quarto disponível para o período selecionado</p>
                </div>
              )}
            </div>
          )}

          {/* Cadastro */}
          {activeTab === "cadastro" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Cadastro de Cliente</h2>
              <form onSubmit={cadastrarCliente} className="max-w-md mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={clienteForm.nome}
                      onChange={(e) => setClienteForm((prev) => ({ ...prev, nome: e.target.value }))}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Digite seu nome completo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={clienteForm.email}
                      onChange={(e) => setClienteForm((prev) => ({ ...prev, email: e.target.value }))}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={clienteForm.telefone}
                      onChange={(e) => setClienteForm((prev) => ({ ...prev, telefone: e.target.value }))}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="(31) 99999-9999"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </button>
              </form>
            </div>
          )}

          {/* Fazer Reserva */}
          {activeTab === "reserva" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Fazer Reserva</h2>
              <form onSubmit={criarReserva} className="max-w-md mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email do Cliente</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={reservaForm.cliente_email}
                      onChange={(e) => setReservaForm((prev) => ({ ...prev, cliente_email: e.target.value }))}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Email cadastrado"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Use o email que você cadastrou no sistema</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quarto</label>
                  <select
                    value={reservaForm.quarto_numero}
                    onChange={(e) => setReservaForm((prev) => ({ ...prev, quarto_numero: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecione um quarto</option>
                    {quartos.map((quarto) => (
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {loading ? "Criando Reserva..." : "Confirmar Reserva"}
                </button>
              </form>
            </div>
          )}

          {/* Minhas Reservas */}
          {activeTab === "minhas-reservas" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Minhas Reservas</h2>

              <div className="mb-8">
                <div className="flex gap-4 max-w-md">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={consultaEmail}
                      onChange={(e) => setConsultaEmail(e.target.value)}
                      placeholder="Digite seu email"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => consultarReservas()}
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    {loading ? "Buscando..." : "Consultar"}
                  </button>
                </div>
              </div>

              {minhasReservas.length > 0 && (
                <div className="space-y-4">
                  {minhasReservas.map((reserva) => (
                    <div key={reserva.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            Quarto {reserva.quarto_numero} - {reserva.quarto_tipo}
                          </h3>
                          <p className="text-gray-600">Reserva #{reserva.id}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              reserva.status === "Confirmada"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {reserva.status}
                          </span>
                          {reserva.pago && (
                            <div className="mt-1">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Pago</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
