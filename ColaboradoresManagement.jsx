import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Plus, Edit, Trash2, Users } from 'lucide-react'
import { apiClient } from '../lib/api'

export default function ColaboradoresManagement() {
  const [colaboradores, setColaboradores] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingColaborador, setEditingColaborador] = useState(null)
  const [formData, setFormData] = useState({ nome: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadColaboradores()
  }, [])

  const loadColaboradores = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getColaboradores()
      setColaboradores(data)
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error)
      alert('Erro ao carregar colaboradores: ' + error.message)
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
      if (editingColaborador) {
        await apiClient.updateColaborador(editingColaborador.id, formData)
      } else {
        await apiClient.createColaborador(formData)
      }
      
      await loadColaboradores()
      setDialogOpen(false)
      setEditingColaborador(null)
      setFormData({ nome: '' })
    } catch (error) {
      console.error('Erro ao salvar colaborador:', error)
      alert('Erro ao salvar colaborador: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (colaborador) => {
    setEditingColaborador(colaborador)
    setFormData({ nome: colaborador.nome })
    setDialogOpen(true)
  }

  const handleDelete = async (colaborador) => {
    if (!confirm(`Tem certeza que deseja excluir o colaborador "${colaborador.nome}"?`)) {
      return
    }

    try {
      await apiClient.deleteColaborador(colaborador.id)
      await loadColaboradores()
    } catch (error) {
      console.error('Erro ao excluir colaborador:', error)
      alert('Erro ao excluir colaborador: ' + error.message)
    }
  }

  const openCreateDialog = () => {
    setEditingColaborador(null)
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
          <h1 className="text-3xl font-bold text-gray-900">Colaboradores</h1>
          <p className="text-gray-600">Gerencie os colaboradores da empresa</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingColaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
              </DialogTitle>
              <DialogDescription>
                {editingColaborador 
                  ? 'Edite as informações do colaborador'
                  : 'Adicione um novo colaborador'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: João Silva"
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
                  {submitting ? 'Salvando...' : (editingColaborador ? 'Salvar' : 'Criar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Colaboradores
          </CardTitle>
          <CardDescription>
            {colaboradores.length} colaborador(es) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {colaboradores.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum colaborador cadastrado</p>
              <Button onClick={openCreateDialog} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar primeiro colaborador
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
                {colaboradores.map((colaborador) => (
                  <TableRow key={colaborador.id}>
                    <TableCell className="font-medium">{colaborador.id}</TableCell>
                    <TableCell>{colaborador.nome}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(colaborador)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(colaborador)}
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

