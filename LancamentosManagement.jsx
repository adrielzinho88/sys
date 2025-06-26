import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Plus, Edit, Trash2, ClipboardList, Filter } from 'lucide-react'
import { apiClient } from '../lib/api'

export default function LancamentosManagement() {
  const [lancamentos, setLancamentos] = useState([])
  const [areas, setAreas] = useState([])
  const [colaboradores, setColaboradores] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLancamento, setEditingLancamento] = useState(null)
  const [formData, setFormData] = useState({
    data: '',
    area_id: '',
    colaborador_id: '',
    quantidade_realizada: ''
  })
  const [filters, setFilters] = useState({
    data_inicio: '',
    data_fim: '',
    area_id: '',
    colaborador_id: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadLancamentos()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      const [areasData, colaboradoresData] = await Promise.all([
        apiClient.getAreas(),
        apiClient.getColaboradores()
      ])
      setAreas(areasData)
      setColaboradores(colaboradoresData)
      await loadLancamentos()
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadLancamentos = async () => {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      )
      const data = await apiClient.getLancamentos(cleanFilters)
      setLancamentos(data)
    } catch (error) {
      console.error('Erro ao carregar lançamentos:', error)
      alert('Erro ao carregar lançamentos: ' + error.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.data || !formData.area_id || !formData.colaborador_id || !formData.quantidade_realizada) {
      alert('Todos os campos são obrigatórios')
      return
    }

    try {
      setSubmitting(true)
      const submitData = {
        ...formData,
        quantidade_realizada: parseInt(formData.quantidade_realizada)
      }

      if (editingLancamento) {
        await apiClient.updateLancamento(editingLancamento.id, submitData)
      } else {
        await apiClient.createLancamento(submitData)
      }
      
      await loadLancamentos()
      setDialogOpen(false)
      setEditingLancamento(null)
      setFormData({
        data: '',
        area_id: '',
        colaborador_id: '',
        quantidade_realizada: ''
      })
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error)
      alert('Erro ao salvar lançamento: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (lancamento) => {
    setEditingLancamento(lancamento)
    setFormData({
      data: lancamento.data,
      area_id: lancamento.area_id.toString(),
      colaborador_id: lancamento.colaborador_id.toString(),
      quantidade_realizada: lancamento.quantidade_realizada.toString()
    })
    setDialogOpen(true)
  }

  const handleDelete = async (lancamento) => {
    if (!confirm(`Tem certeza que deseja excluir este lançamento?`)) {
      return
    }

    try {
      await apiClient.deleteLancamento(lancamento.id)
      await loadLancamentos()
    } catch (error) {
      console.error('Erro ao excluir lançamento:', error)
      alert('Erro ao excluir lançamento: ' + error.message)
    }
  }

  const openCreateDialog = () => {
    setEditingLancamento(null)
    setFormData({
      data: new Date().toISOString().split('T')[0], // Data atual
      area_id: '',
      colaborador_id: '',
      quantidade_realizada: ''
    })
    setDialogOpen(true)
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

  const clearFilters = () => {
    setFilters({
      data_inicio: '',
      data_fim: '',
      area_id: '',
      colaborador_id: ''
    })
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lançamentos de Produção</h1>
          <p className="text-gray-600">Registre e gerencie os lançamentos diários de produção</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Lançamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLancamento ? 'Editar Lançamento' : 'Novo Lançamento'}
              </DialogTitle>
              <DialogDescription>
                {editingLancamento 
                  ? 'Edite as informações do lançamento'
                  : 'Registre um novo lançamento de produção'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="area_id">Área</Label>
                  <Select value={formData.area_id} onValueChange={(value) => setFormData({ ...formData, area_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma área" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id.toString()}>
                          {area.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="colaborador_id">Colaborador</Label>
                  <Select value={formData.colaborador_id} onValueChange={(value) => setFormData({ ...formData, colaborador_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um colaborador" />
                    </SelectTrigger>
                    <SelectContent>
                      {colaboradores.map((colaborador) => (
                        <SelectItem key={colaborador.id} value={colaborador.id.toString()}>
                          {colaborador.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantidade_realizada">Quantidade Realizada</Label>
                  <Input
                    id="quantidade_realizada"
                    type="number"
                    value={formData.quantidade_realizada}
                    onChange={(e) => setFormData({ ...formData, quantidade_realizada: e.target.value })}
                    placeholder="Ex: 150"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Salvando...' : (editingLancamento ? 'Salvar' : 'Criar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div>
              <Label htmlFor="filter_area">Área</Label>
              <Select value={filters.area_id} onValueChange={(value) => setFilters({ ...filters, area_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as áreas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as áreas</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter_colaborador">Colaborador</Label>
              <Select value={filters.colaborador_id} onValueChange={(value) => setFilters({ ...filters, colaborador_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os colaboradores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os colaboradores</SelectItem>
                  {colaboradores.map((colaborador) => (
                    <SelectItem key={colaborador.id} value={colaborador.id.toString()}>
                      {colaborador.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Lista de Lançamentos
          </CardTitle>
          <CardDescription>
            {lancamentos.length} lançamento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lancamentos.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum lançamento encontrado</p>
              <Button onClick={openCreateDialog} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Fazer primeiro lançamento
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lancamentos.map((lancamento) => (
                  <TableRow key={lancamento.id}>
                    <TableCell>{formatDate(lancamento.data)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{lancamento.area_nome}</Badge>
                    </TableCell>
                    <TableCell>{lancamento.colaborador_nome}</TableCell>
                    <TableCell className="font-medium">{lancamento.quantidade_realizada}</TableCell>
                    <TableCell>
                      <Badge variant={lancamento.saldo >= 0 ? "default" : "destructive"}>
                        {lancamento.saldo >= 0 ? '+' : ''}{lancamento.saldo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(lancamento.valor_receber)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(lancamento)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(lancamento)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

