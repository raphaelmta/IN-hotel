"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Shield, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import AdminDashboard from "./dashboard"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      const isValid = await api.verifyAdminToken()
      setIsAuthenticated(isValid)
    } catch (error) {
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await api.adminLogin(loginForm.username, loginForm.password)
      setIsAuthenticated(true)
      setMessage({ type: "success", text: "Login realizado com sucesso!" })
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao fazer login" })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    api.adminLogout()
    setIsAuthenticated(false)
    setLoginForm({ username: "", password: "" })
    setMessage({ type: "success", text: "Logout realizado com sucesso!" })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <Shield className="h-16 w-16 text-purple-600 mx-auto mb-4 animate-pulse" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        {/* Header */}
        <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-100">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-3">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Infinity Hotel
                  </span>
                  <div className="text-xs text-gray-500">Área Administrativa</div>
                </div>
              </Link>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
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

            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl inline-block mb-4">
                  <Shield className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Acesso Administrativo</h1>
                <p className="text-gray-600">Digite suas credenciais para acessar o sistema</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Usuário</label>
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="admin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                      required
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Digite sua senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 font-medium"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Credenciais padrão:</p>
                <p>
                  Usuário: <code className="bg-gray-100 px-2 py-1 rounded">admin</code>
                </p>
                <p>
                  Senha: <code className="bg-gray-100 px-2 py-1 rounded">admin123</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <AdminDashboard onLogout={handleLogout} />
}
