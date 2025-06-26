import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  BarChart3, 
  Users, 
  Target, 
  ClipboardList, 
  MessageSquare,
  Home,
  Plus,
  Calendar,
  TrendingUp,
  LogOut,
  User
} from 'lucide-react'
import { apiClient } from './lib/api'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import AreasManagement from './components/AreasManagement'
import ColaboradoresManagement from './components/ColaboradoresManagement'
import MetasManagement from './components/MetasManagement'
import LancamentosManagement from './components/LancamentosManagement'
import ObservacoesManagement from './components/ObservacoesManagement'
import Relatorios from './components/Relatorios'
import './App.css'

function Navigation({ user, onLogout }) {
  const location = useLocation()
  const isAdmin = user?.role === 'admin'
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home, show: true },
    { path: '/areas', label: 'Áreas', icon: BarChart3, show: isAdmin },
    { path: '/colaboradores', label: 'Colaboradores', icon: Users, show: isAdmin },
    { path: '/metas', label: 'Metas', icon: Target, show: isAdmin },
    { path: '/lancamentos', label: 'Lançamentos', icon: ClipboardList, show: true },
    { path: '/observacoes', label: 'Observações', icon: MessageSquare, show: isAdmin },
    { path: '/relatorios', label: 'Relatórios', icon: TrendingUp, show: true }
  ].filter(item => item.show)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Sistema de Metas</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
          
          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{user?.username}</span>
              {isAdmin && (
                <Badge variant="secondary" className="text-xs">
                  Admin
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function AppContent({ user }) {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await apiClient.logout()
      window.location.reload() // Força reload para limpar estado
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} onLogout={handleLogout} />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            {user?.role === 'admin' && (
              <>
                <Route path="/areas" element={<AreasManagement user={user} />} />
                <Route path="/colaboradores" element={<ColaboradoresManagement user={user} />} />
                <Route path="/metas" element={<MetasManagement user={user} />} />
                <Route path="/observacoes" element={<ObservacoesManagement user={user} />} />
              </>
            )}
            <Route path="/lancamentos" element={<LancamentosManagement user={user} />} />
            <Route path="/relatorios" element={<Relatorios user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await apiClient.checkAuth()
      if (response.authenticated && response.user) {
        setUser(response.user)
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return <AppContent user={user} />
}

export default App

