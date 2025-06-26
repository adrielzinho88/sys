import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { BarChart3, Users, Target, ClipboardList, TrendingUp, Calendar } from 'lucide-react'
import { apiClient } from '../lib/api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAreas: 0,
    totalColaboradores: 0,
    totalMetas: 0,
    totalLancamentos: 0
  })
  const [recentLancamentos, setRecentLancamentos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Carregar estatísticas
      const [areas, colaboradores, metas, lancamentos] = await Promise.all([
        apiClient.getAreas(),
        apiClient.getColaboradores(),
        apiClient.getMetas(),
        apiClient.getLancamentos()
      ])

      setStats({
        totalAreas: areas.length,
        totalColaboradores: colaboradores.length,
        totalMetas: metas.length,
        totalLancamentos: lancamentos.length
      })

      // Pegar os 5 lançamentos mais recentes
      setRecentLancamentos(lancamentos.slice(0, 5))
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema de metas e lançamentos</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Áreas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAreas}</div>
            <p className="text-xs text-muted-foreground">
              Áreas de produção cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colaboradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalColaboradores}</div>
            <p className="text-xs text-muted-foreground">
              Colaboradores ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMetas}</div>
            <p className="text-xs text-muted-foreground">
              Metas configuradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lançamentos</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLancamentos}</div>
            <p className="text-xs text-muted-foreground">
              Total de lançamentos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lançamentos recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Lançamentos Recentes
          </CardTitle>
          <CardDescription>
            Os 5 lançamentos mais recentes no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentLancamentos.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nenhum lançamento encontrado
            </p>
          ) : (
            <div className="space-y-4">
              {recentLancamentos.map((lancamento) => (
                <div
                  key={lancamento.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{lancamento.colaborador_nome}</span>
                      <Badge variant="outline">{lancamento.area_nome}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Data: {formatDate(lancamento.data)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {lancamento.quantidade_realizada} unidades
                    </div>
                    <div className="text-sm text-green-600">
                      {formatCurrency(lancamento.valor_receber)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-20 flex flex-col gap-2"
              onClick={() => window.location.href = '/lancamentos'}
            >
              <ClipboardList className="h-6 w-6" />
              Novo Lançamento
            </Button>
            <Button 
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => window.location.href = '/metas'}
            >
              <Target className="h-6 w-6" />
              Gerenciar Metas
            </Button>
            <Button 
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => window.location.href = '/relatorios'}
            >
              <TrendingUp className="h-6 w-6" />
              Ver Relatórios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

