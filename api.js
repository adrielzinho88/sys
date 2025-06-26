const API_BASE_URL = 'http://localhost:5000/api'

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Importante para cookies de sessão
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Autenticação
  async checkAuth() {
    return this.request('/check-auth')
  }

  async login(credentials) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async logout() {
    return this.request('/logout', {
      method: 'POST',
    })
  }

  async getCurrentUser() {
    return this.request('/me')
  }

  async createAdmin(userData) {
    return this.request('/create-admin', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  // Áreas
  async getAreas() {
    return this.request('/areas')
  }

  async createArea(data) {
    return this.request('/areas', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateArea(id, data) {
    return this.request(`/areas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteArea(id) {
    return this.request(`/areas/${id}`, {
      method: 'DELETE',
    })
  }

  // Colaboradores
  async getColaboradores() {
    return this.request('/colaboradores')
  }

  async createColaborador(data) {
    return this.request('/colaboradores', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateColaborador(id, data) {
    return this.request(`/colaboradores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteColaborador(id) {
    return this.request(`/colaboradores/${id}`, {
      method: 'DELETE',
    })
  }

  // Metas
  async getMetas() {
    return this.request('/metas')
  }

  async createMeta(data) {
    return this.request('/metas', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateMeta(id, data) {
    return this.request(`/metas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteMeta(id) {
    return this.request(`/metas/${id}`, {
      method: 'DELETE',
    })
  }

  async getMetasByArea(areaId) {
    return this.request(`/metas/area/${areaId}`)
  }

  // Lançamentos
  async getLancamentos(filters = {}) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    const queryString = params.toString()
    return this.request(`/lancamentos${queryString ? `?${queryString}` : ''}`)
  }

  async createLancamento(data) {
    return this.request('/lancamentos', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateLancamento(id, data) {
    return this.request(`/lancamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteLancamento(id) {
    return this.request(`/lancamentos/${id}`, {
      method: 'DELETE',
    })
  }

  // Observações
  async getObservacoes(filters = {}) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    const queryString = params.toString()
    return this.request(`/observacoes${queryString ? `?${queryString}` : ''}`)
  }

  async createObservacao(data) {
    return this.request('/observacoes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateObservacao(id, data) {
    return this.request(`/observacoes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteObservacao(id) {
    return this.request(`/observacoes/${id}`, {
      method: 'DELETE',
    })
  }

  // Relatórios
  async getRelatorioProducaoPorColaborador(filters = {}) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    const queryString = params.toString()
    return this.request(`/lancamentos/relatorios/producao-colaborador${queryString ? `?${queryString}` : ''}`)
  }

  async getRelatorioProducaoPorArea(filters = {}) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    const queryString = params.toString()
    return this.request(`/lancamentos/relatorios/producao-area${queryString ? `?${queryString}` : ''}`)
  }
}

export const apiClient = new ApiClient()

