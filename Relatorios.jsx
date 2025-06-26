import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { TrendingUp, Users, BarChart3, Download } from 'lucide-react'
import { apiClient } from '../lib/api'

export default function Relatorios() {
  const [relatorioColaboradores, setRelatorioColaboradores] = useState([])
  const [relatorioAreas, setRelatorioAreas] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    data_inicio: '',
    data_fim: ''
  })

  useEffect(() => {
    // Carregar relatórios com dados do mês atual por padrão
    const hoje = new Date()
    const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const ultimoDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    
    setFilters({
      data_inicio: primeiroDiaDoMes.toISOString().split('T')[0],
      data_fim: ultimoDiaDoMes.toISOString().split('T')[0]
    })
  }, [])

  useEffect(() => {
    if (filters.data_inicio && filters.data_fim) {
      loadRelatorios()
    }
  }, [filters])

  const loadRelatorios = async () => {
    try {
      setLoading(true)
      const [colaboradoresData, areasData] = await Promise.all([
        apiClient.getRelatorioProducaoPorColaborador(filters),
        apiClient.getRelatorioProducaoPorArea(filters)
      ])
      setRelatorioColaboradores(colaboradoresData)
      setRelatorioAreas(areasData)
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
      alert('Erro ao carregar relatórios: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const exportToCSV = (data, filename) => {
    if (data.length === 0) {
      alert('Não há dados para exportar')
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getTotalColaboradores = () => {
    return relatorioColaboradores.reduce((total, item) => total + item.total_produzido, 0)
  }

  const getTotalValorColaboradores = () => {
    return relatorioColaboradores.reduce((total, item) => total + item.total_valor, 0)
  }

  const getTotalAreas = () => {
    return relatorioAreas.reduce((total, item) => total + item.total_produzido, 0)
  }

  const getTotalValorAreas = () => {
    return relatorioAreas.reduce((total, item) => total + item.total_valor, 0)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600">Visualize relatórios de produção e desempenho</p>
      </div>

      {/* Filtros de período */}
      <Card>
        <CardHeader>
          <CardTitle>Período do Relatório</CardTitle>
          <CardDescription>
            Selecione o período para gerar os relatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="data_inicio">Data Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={filters.data_inicio}
                onChange={(e) => setFilters({ ...filters, data_inicio: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="data_fim">Data Fim</Label>
              <Input
                id="data_fim"
                type="date"
                value={filters.data_fim}
                onChange={(e) => setFilters({ ...filters, data_fim: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={loadRelatorios} disabled={loading}>
                {loading ? 'Carregando...' : 'Gerar Relatórios'}
              </Button>
            </div>
          </div>
          {filters.data_inicio && filters.data_fim && (
            <p className="text-sm text-gray-600 mt-2">
              Período: {formatDate(filters.data_inicio)} até {formatDate(filters.data_fim)}
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="colaboradores" className="space-y-4">
        <TabsList>
          <TabsTrigger value="colaboradores" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Por Colaborador
          </TabsTrigger>
          <TabsTrigger value="areas" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Por Área
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colaboradores">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Relatório por Colaborador
                  </CardTitle>
                  <CardDescription>
                    Produção e valores por colaborador no período selecionado
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => exportToCSV(relatorioColaboradores, 'relatorio_colaboradores')}
                  disabled={relatorioColaboradores.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {relatorioColaboradores.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {loading ? 'Carregando relatório...' : 'Nenhum dado encontrado para o período selecionado'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Resumo */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{relatorioColaboradores.length}</div>
                        <p className="text-xs text-muted-foreground">Colaboradores ativos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{getTotalColaboradores().toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total produzido</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(getTotalValorColaboradores())}
                        </div>
                        <p className="text-xs text-muted-foreground">Total a receber</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tabela */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Colaborador</TableHead>
                        <TableHead className="text-right">Total Produzido</TableHead>
                        <TableHead className="text-right">Média Diária</TableHead>
                        <TableHead className="text-right">Total a Receber</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatorioColaboradores
                        .sort((a, b) => b.total_valor - a.total_valor)
                        .map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.colaborador}</TableCell>
                          <TableCell className="text-right">{item.total_produzido.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.media_producao.toFixed(1)}</TableCell>
                          <TableCell className="text-right text-green-600 font-medium">
                            {formatCurrency(item.total_valor)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="areas">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Relatório por Área
                  </CardTitle>
                  <CardDescription>
                    Produção e valores por área no período selecionado
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => exportToCSV(relatorioAreas, 'relatorio_areas')}
                  disabled={relatorioAreas.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {relatorioAreas.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {loading ? 'Carregando relatório...' : 'Nenhum dado encontrado para o período selecionado'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Resumo */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{relatorioAreas.length}</div>
                        <p className="text-xs text-muted-foreground">Áreas ativas</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{getTotalAreas().toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total produzido</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(getTotalValorAreas())}
                        </div>
                        <p className="text-xs text-muted-foreground">Total investido</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tabela */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Área</TableHead>
                        <TableHead className="text-right">Total Produzido</TableHead>
                        <TableHead className="text-right">Média Diária</TableHead>
                        <TableHead className="text-right">Total Investido</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatorioAreas
                        .sort((a, b) => b.total_valor - a.total_valor)
                        .map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.area}</TableCell>
                          <TableCell className="text-right">{item.total_produzido.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.media_producao.toFixed(1)}</TableCell>
                          <TableCell className="text-right text-green-600 font-medium">
                            {formatCurrency(item.total_valor)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

