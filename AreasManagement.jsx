import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Plus, Edit, Trash2, BarChart3 } from 'lucide-react'
import { apiClient } from '../lib/api'

export default function AreasManagement() {
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingArea, setEditingArea] = useState(null)
  const [formData, setFormData] = useState({ nome: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadAreas()
  }, [])

  const loadAreas = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getAreas()
      setAreas(data)
    } catch (error) {
      console.error('Erro ao carregar áreas:', error)
      alert('Erro ao carregar áreas: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nome.trim()) {
      alert('Nome é obrigatório')
      return
    }

    try {
      setSubmitting(true)
      if (editingArea) {
        await apiClient.updateArea(editingArea.id, formData)
      } else {
        await apiClient.createArea(formData)
      }
      
      await loadAreas()
      setDialogOpen(false)
      setEditingArea(null)
      setFormData({ nome: '' })
    } catch (error) {
      console.error('Erro ao salvar área:', error)
      alert('Erro ao salvar área: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (area) => {
    setEditingArea(area)
    setFormData({ nome: area.nome })
    setDialogOpen(true)
  }

  const handleDelete = async (area) => {
    if (!confirm(`Tem certeza que deseja excluir a área "${area.nome}"?`)) {
      return
    }

    try {
      await apiClient.deleteArea(area.id)
      await loadAreas()
    } catch (error) {
      console.error('Erro ao excluir área:', error)
      alert('Erro ao excluir área: ' + error.message)
    }
  }

  const openCreateDialog = () => {
    setEditingArea(null)
    setFormData({ nome: '' })
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
          <h1 className="text-3xl font-bold text-gray-900">Áreas de Produção</h1>
          <p className="text-gray-600">Gerencie as áreas de produção da empresa</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Área
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingArea ? 'Editar Área' : 'Nova Área'}
              </DialogTitle>
              <DialogDescription>
                {editingArea 
                  ? 'Edite as informações da área de produção'
                  : 'Adicione uma nova área de produção'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome da Área</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Alça, Fundo, Topo..."
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
                  {submitting ? 'Salvando...' : (editingArea ? 'Salvar' : 'Criar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Lista de Áreas
          </CardTitle>
          <CardDescription>
            {areas.length} área(s) cadastrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {areas.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma área cadastrada</p>
              <Button onClick={openCreateDialog} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar primeira área
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areas.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell className="font-medium">{area.id}</TableCell>
                    <TableCell>{area.nome}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(area)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(area)}
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

