import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Plus, Edit, Trash2, MessageSquare, Filter } from 'lucide-react'
import { apiClient } from '../lib/api'

export default function ObservacoesManagement() {
  const [observacoes, setObservacoes] = useState([])
  const [colaboradores, setColaboradores] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingObservacao, setEditingObservacao] = useState(null)
  const [formData, setFormData] = useState({
    colaborador_id: '',
    data: '',
    tipo_observacao: '',
    descricao: ''
  })
  const [filters, setFilters] = useState({
    data_inicio: '',
    data_fim: '',
    colaborador_id: '',
    tipo_observacao: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const tiposObservacao = [
    'férias',
    'falta',
    'treinamento',
    'atestado',
    'licença',
    'outros'
  ]

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadObservacoes()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      const colaboradoresData = await apiClient.getColaboradores()
      setColaboradores(colaboradoresData)
      await loadObservacoes()
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadObservacoes = async () => {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      )
      const data = await apiClient.getObservacoes(cleanFilters)
      setObservacoes(data)
    } catch (error) {
      console.error('Erro ao carregar observações:', error)
      alert('Erro ao carregar observações: ' + error.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.colaborador_id || !formData.data || !formData.tipo_observacao) {
      alert('Colaborador, data e tipo de observação são obrigatórios')
      return
    }

    try {
      setSubmitting(true)

      if (editingObservacao) {
        await apiClient.updateObservacao(editingObservacao.id, formData)
      } else {
        await apiClient.createObservacao(formData)
      }
      
      await loadObservacoes()
      setDialogOpen(false)
      setEditingObservacao(null)
      setFormData({
        colaborador_id: '',
        data: '',
        tipo_observacao: '',
        descricao: ''
      })
    } catch (error) {
      console.error('Erro ao salvar observação:', error)
      alert('Erro ao salvar observação: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (observacao) => {
    setEditingObservacao(observacao)
    setFormData({
      colaborador_id: observacao.colaborador_id.toString(),
      data: observacao.data,
      tipo_observacao: observacao.tipo_observacao,
      descricao: observacao.descricao || ''
    })
    setDialogOpen(true)
  }

  const handleDelete = async (observacao) => {
    if (!confirm(`Tem certeza que deseja excluir esta observação?`)) {
      return
    }

    try {
      await apiClient.deleteObservacao(observacao.id)
      await loadObservacoes()
    } catch (error) {
      console.error('Erro ao excluir observação:', error)
      alert('Erro ao excluir observação: ' + error.message)
    }
  }

  const openCreateDialog = () => {
    setEditingObservacao(null)
    setFormData({
      colaborador_id: '',
      data: new Date().toISOString().split('T')[0], // Data atual
      tipo_observacao: '',
      descricao: ''
    })
    setDialogOpen(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const clearFilters = () => {
    setFilters({
      data_inicio: '',
      data_fim: '',
      colaborador_id: '',
      tipo_observacao: ''
    })
  }

  const getBadgeVariant = (tipo) => {
    switch (tipo.toLowerCase()) {
      case 'férias':
        return 'default'
      case 'falta':
        return 'destructive'
      case 'treinamento':
        return 'secondary'
      case 'atestado':
        return 'outline'
      default:
        return 'outline'
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Observações</h1>
          <p className="text-gray-600">Gerencie observações sobre os colaboradores</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Observação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingObservacao ? 'Editar Observação' : 'Nova Observação'}
              </DialogTitle>
              <DialogDescription>
                {editingObservacao 
                  ? 'Edite as informações da observação'
                  : 'Adicione uma nova observação sobre um colaborador'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
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
                  <Label htmlFor="tipo_observacao">Tipo de Observação</Label>
                  <Select value={formData.tipo_observacao} onValueChange={(value) => setFormData({ ...formData, tipo_observacao: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposObservacao.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição (Opcional)</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Detalhes adicionais sobre a observação..."
                    rows={3}
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
                  {submitting ? 'Salvando...' : (editingObservacao ? 'Salvar' : 'Criar')}
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
            <div>
              <Label htmlFor="filter_tipo">Tipo</Label>
              <Select value={filters.tipo_observacao} onValueChange={(value) => setFilters({ ...filters, tipo_observacao: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  {tiposObservacao.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
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
            <MessageSquare className="h-5 w-5" />
            Lista de Observações
          </CardTitle>
          <CardDescription>
            {observacoes.length} observação(ões) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {observacoes.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma observação encontrada</p>
              <Button onClick={openCreateDialog} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar primeira observação
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {observacoes.map((observacao) => (
                  <TableRow key={observacao.id}>
                    <TableCell>{formatDate(observacao.data)}</TableCell>
                    <TableCell className="font-medium">{observacao.colaborador_nome}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(observacao.tipo_observacao)}>
                        {observacao.tipo_observacao.charAt(0).toUpperCase() + observacao.tipo_observacao.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {observacao.descricao || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(observacao)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(observacao)}
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

