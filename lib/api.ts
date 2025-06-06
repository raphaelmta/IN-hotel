const API_BASE_URL = "http://localhost:8000/api"

// Tipos
export interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  created_at: string
  tipo?: string
}

export interface Quarto {
  numero: string
  tipo: string
  preco: string
  status: boolean
  created_at: string
}

export interface Reserva {
  id: string
  cliente_id: string
  quarto_numero: string
  data_check_in: string
  data_check_out: string
  status: string
  pago: boolean
  created_at: string
  cliente_nome: string
  quarto_tipo: string
  quarto_preco?: string
  origem?: string
  cancelled_at?: string
  paid_at?: string
  reactivated_at?: string
}

export interface HotelInfo {
  nome: string
  endereco: string
  telefone: string
}

export interface DashboardStats {
  total_quartos: number
  quartos_disponiveis: number
  total_clientes: number
  reservas_ativas: number
  total_reservas: number
  reservas_pagas?: number
  reservas_pendentes?: number
  ocupacao: number
}

// Classe para gerenciar a API
class ApiClient {
  private token: string | null = null

  constructor() {
    // Recuperar token do localStorage se existir
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("admin_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token")
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit, retries = 3): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...options?.headers,
        }

        // Adicionar token de autorização se disponível
        if (this.token) {
          headers.Authorization = `Bearer ${this.token}`
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        })

        if (!response.ok) {
          const error = await response.json().catch(() => ({
            detail: `HTTP ${response.status}: ${response.statusText}`,
          }))
          throw new Error(error.detail || `HTTP ${response.status}`)
        }

        return response.json()
      } catch (error) {
        if (i === retries - 1) {
          if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new Error("Erro de conexão: Verifique se o backend está rodando em http://localhost:8000")
          }
          throw error
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
    throw new Error("Falha após múltiplas tentativas")
  }

  // Teste de conectividade
  async testConnection(): Promise<boolean> {
    try {
      await fetch(`${API_BASE_URL.replace("/api", "")}/health`)
      return true
    } catch {
      return false
    }
  }

  // ==================== AUTENTICAÇÃO ====================

  async adminLogin(username: string, password: string): Promise<string> {
    const response = await this.request<{ access_token: string }>("/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
    this.setToken(response.access_token)
    return response.access_token
  }

  async verifyAdminToken(): Promise<boolean> {
    try {
      await this.request("/admin/verify")
      return true
    } catch {
      this.clearToken()
      return false
    }
  }

  adminLogout() {
    this.clearToken()
  }

  // ==================== ROTAS PÚBLICAS (CLIENTE) ====================

  async getPublicHotelInfo(): Promise<HotelInfo> {
    return this.request<HotelInfo>("/public/hotel-info")
  }

  async getQuartosDisponiveisPublic(): Promise<Quarto[]> {
    return this.request<Quarto[]>("/public/quartos-disponiveis")
  }

  async getQuartosDisponiveisPeriodo(checkIn: string, checkOut: string): Promise<Quarto[]> {
    return this.request<Quarto[]>(`/public/quartos-disponiveis-periodo?check_in=${checkIn}&check_out=${checkOut}`)
  }

  async cadastrarClientePublic(
    cliente: Omit<Cliente, "id" | "created_at">,
  ): Promise<{ message: string; cliente: Cliente }> {
    return this.request<{ message: string; cliente: Cliente }>("/public/cliente/cadastrar", {
      method: "POST",
      body: JSON.stringify(cliente),
    })
  }

  async criarReservaPublic(reserva: {
    cliente_email: string
    quarto_numero: string
    data_check_in: string
    data_check_out: string
  }): Promise<{ message: string; reserva: Reserva }> {
    return this.request<{ message: string; reserva: Reserva }>("/public/reserva/criar", {
      method: "POST",
      body: JSON.stringify(reserva),
    })
  }

  async getReservasCliente(email: string): Promise<Reserva[]> {
    return this.request<Reserva[]>(`/public/cliente/reservas/${encodeURIComponent(email)}`)
  }

  // ==================== ROTAS ADMINISTRATIVAS ====================

  async getAdminDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>("/admin/dashboard/stats")
  }

  async getAdminClientes(): Promise<Cliente[]> {
    return this.request<Cliente[]>("/admin/clientes")
  }

  async createAdminCliente(cliente: Omit<Cliente, "id" | "created_at">): Promise<Cliente> {
    return this.request<Cliente>("/admin/clientes", {
      method: "POST",
      body: JSON.stringify(cliente),
    })
  }

  async updateAdminCliente(id: string, cliente: Omit<Cliente, "id" | "created_at">): Promise<Cliente> {
    return this.request<Cliente>(`/admin/clientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(cliente),
    })
  }

  async deleteAdminCliente(id: string): Promise<void> {
    return this.request<void>(`/admin/clientes/${id}`, {
      method: "DELETE",
    })
  }

  async getAdminQuartos(): Promise<Quarto[]> {
    return this.request<Quarto[]>("/admin/quartos")
  }

  async createAdminQuarto(quarto: Omit<Quarto, "created_at">): Promise<Quarto> {
    return this.request<Quarto>("/admin/quartos", {
      method: "POST",
      body: JSON.stringify(quarto),
    })
  }

  async updateAdminQuarto(numero: string, quarto: Omit<Quarto, "created_at">): Promise<Quarto> {
    return this.request<Quarto>(`/admin/quartos/${numero}`, {
      method: "PUT",
      body: JSON.stringify(quarto),
    })
  }

  async deleteAdminQuarto(numero: string): Promise<void> {
    return this.request<void>(`/admin/quartos/${numero}`, {
      method: "DELETE",
    })
  }

  async getAdminReservas(): Promise<Reserva[]> {
    return this.request<Reserva[]>("/admin/reservas")
  }

  async createAdminReserva(reserva: {
    cliente_id: string
    quarto_numero: string
    data_check_in: string
    data_check_out: string
    pago?: boolean
  }): Promise<{ message: string; reserva: Reserva }> {
    return this.request<{ message: string; reserva: Reserva }>("/admin/reservas", {
      method: "POST",
      body: JSON.stringify(reserva),
    })
  }

  async cancelAdminReserva(id: string): Promise<void> {
    return this.request<void>(`/admin/reservas/${id}/cancelar`, {
      method: "PUT",
    })
  }

  async toggleAdminPayment(id: string): Promise<void> {
    return this.request<void>(`/admin/reservas/${id}/pagamento`, {
      method: "PUT",
    })
  }

  async deleteAdminReserva(id: string): Promise<void> {
    return this.request<void>(`/admin/reservas/${id}`, {
      method: "DELETE",
    })
  }

  async reactivateAdminReserva(id: string): Promise<void> {
    return this.request<void>(`/admin/reservas/${id}/reativar`, {
      method: "PUT",
    })
  }

  async getAdminHotelInfo(): Promise<HotelInfo> {
    return this.request<HotelInfo>("/admin/hotel-info")
  }

  async updateAdminHotelInfo(info: HotelInfo): Promise<HotelInfo> {
    return this.request<HotelInfo>("/admin/hotel-info", {
      method: "PUT",
      body: JSON.stringify(info),
    })
  }
}

export const api = new ApiClient()
