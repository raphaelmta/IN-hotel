"use client"

import { useState, useEffect } from "react"
import { Hotel, Users, Shield, Calendar, MapPin, Phone, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"
import { api, type HotelInfo } from "@/lib/api"

export default function HomePage() {
  const [hotelInfo, setHotelInfo] = useState<HotelInfo>({
    nome: "Infinity Hotel",
    endereco: "Av. do Contorno, 6480 - Savassi, Belo Horizonte",
    telefone: "(31) 3333-4444",
  })
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    checkConnection()
  }, [])

  const checkConnection = async () => {
    const connected = await api.testConnection()
    setIsConnected(connected)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await api.getPublicHotelInfo()
      setHotelInfo(data)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Hotel className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {hotelInfo.nome}
                </span>
                <div className="flex items-center gap-1">
                  {isConnected ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-xs text-gray-500">{isConnected ? "Online" : "Offline"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-3xl inline-block mb-6">
            <Hotel className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Bem-vindo ao {hotelInfo.nome}</h1>
          <p className="text-xl text-gray-600 mb-2">Sistema de Gerenciamento de Reservas</p>
          <div className="flex items-center justify-center gap-4 text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{hotelInfo.endereco}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              <span className="text-sm">{hotelInfo.telefone}</span>
            </div>
          </div>
        </div>

        {/* Access Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Cliente Access */}
          <Link href="/cliente">
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-blue-100 group">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Área do Cliente</h2>
                <p className="text-gray-600 mb-6 text-lg">Faça suas reservas de forma rápida e fácil</p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Cadastro simples e rápido</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Consultar quartos disponíveis</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Fazer reservas online</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Acompanhar suas reservas</span>
                  </div>
                </div>
                <div className="mt-6 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium inline-block">
                  Acesso Livre - Sem Senha
                </div>
              </div>
            </div>
          </Link>

          {/* Admin Access */}
          <Link href="/admin">
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-purple-100 group">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Área Administrativa</h2>
                <p className="text-gray-600 mb-6 text-lg">Gerencie todo o sistema do hotel</p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Gerenciar quartos e preços</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Cadastrar e editar clientes</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Controlar reservas e pagamentos</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Dashboard com estatísticas</span>
                  </div>
                </div>
                <div className="mt-6 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium inline-block">
                  Acesso Restrito - Requer Senha
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Recursos do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-gray-200">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Reservas Online</h4>
              <p className="text-sm text-gray-600">Sistema completo de reservas com verificação de disponibilidade</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-gray-200">
              <Shield className="h-8 w-8 text-purple-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Gestão Segura</h4>
              <p className="text-sm text-gray-600">Área administrativa protegida com autenticação</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-gray-200">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Fácil de Usar</h4>
              <p className="text-sm text-gray-600">Interface intuitiva para clientes e administradores</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500">
          <p className="text-sm">© 2024 {hotelInfo.nome} - Sistema de Gerenciamento de Reservas</p>
          <p className="text-xs mt-2">Desenvolvido com Python FastAPI + Next.js</p>
        </div>
      </div>
    </div>
  )
}
