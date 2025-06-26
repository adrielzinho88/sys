import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Plus, Edit, Trash2, Target } from 'lucide-react'
import { apiClient } from '../lib/api'

export default function MetasManagement({ user }) {
  const [metas, setMetas] = useState([])
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMeta, setEditingMeta] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    area_id: '',
    meta_quantidade: '',
    valor_unitario: '',
    data_vigencia: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [metasData, areasData] = await Promise.all([
        apiClient.getMetas(),
        apiClient.getAreas()
      ])
      setMetas(metasData)
      setAreas(areasData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const dataToSend = {
        nome: formData.nome,
        area_id: parseInt(formData.area_id),
        meta_quantidade: parseInt(formData.meta_quantidade),
        valor_unitario: parseFloat(formData.valor_unitario),
        data_vigencia: formData.data_vigencia || null
      }

      if (editingMeta) {
        await apiClient.updateMeta(editingMeta.id, dataToSend)
      } else {
        await apiClient.createMeta(dataToSend)
      }

      await loadData()
      resetForm()
      setDialogOpen(false)
    } catch (error) {
      console.error('Erro ao salvar meta:', error)
      alert('Erro ao salvar meta: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (meta) => {
    setEditingMeta(meta)
    setFormData({
      nome: meta.nome || '',
      area_id: meta.area_id.toString(),
      meta_quantidade: meta.meta_quantidade.toString(),
      valor_unitario: meta.valor_unitario.toString(),
      data_vigencia: meta.data_vigencia || ''
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta meta?')) return

    try {
      await apiClient.deleteMeta(id)
      await loadData()
    } catch (error) {
      console.error('Erro ao deletar meta:', error)
      alert('Erro ao deletar meta: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      area_id: '',
      meta_quantidade: '',
      valor_unitario: '',
      data_vigencia: ''
    })
    setEditingMeta(null)
  }

  const handleNewMeta = () => {
    resetForm()
    setDialogOpen(true)
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Target className="mr-3 h-8 w-8 text-blue-600" />
            Gerenciamento de Metas
          </h1>
          <p className="mt-2 text-gray-600">
            Defina e gerencie as metas de produção por área
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewMeta} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nova Meta</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingMeta ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
              <DialogDescription>
                {editingMeta ? 'Atualize os dados da meta' : 'Preencha os dados para criar uma nova meta'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Meta</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Meta Mensal Alça"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="area">Área</Label>
                  <Select 
                    value={formData.area_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, area_id: value }))}
                  >
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

                <div className="space-y-2">
                  <Label htmlFor="meta_quantidade">Quantidade Meta</Label>
                  <Input
                    id="meta_quantidade"
                    type="number"
                    value={formData.meta_quantidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_quantidade: e.target.value }))}
                    placeholder="Ex: 100"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_unitario">Valor Unitário (R$)</Label>
                  <Input
                    id="valor_unitario"
                    type="number"
                    step="0.01"
                    value={formData.valor_unitario}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor_unitario: e.target.value }))}
                    placeholder="Ex: 15.50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_vigencia">Data de Vigência</Label>
                  <Input
                    id="data_vigencia"
                    type="date"
                    value={formData.data_vigencia}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_vigencia: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Salvando...' : (editingMeta ? 'Atualizar' : 'Criar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metas Cadastradas</CardTitle>
          <CardDescription>
            Lista de todas as metas de produção
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma meta cadastrada ainda.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor Unitário</TableHead>
                  <TableHead>Data Vigência</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metas.map((meta) => (
                  <TableRow key={meta.id}>
                    <TableCell className="font-medium">{meta.nome || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{meta.area_nome}</Badge>
                    </TableCell>
                    <TableCell>{meta.meta_quantidade}</TableCell>
                    <TableCell>R$ {meta.valor_unitario.toFixed(2)}</TableCell>
                    <TableCell>
                      {meta.data_vigencia ? new Date(meta.data_vigencia).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(meta)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(meta.id)}
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

