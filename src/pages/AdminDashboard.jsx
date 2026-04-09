import { useState, useEffect } from 'react'
import Header from '../components/Layout/Header'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Users, FileText, DollarSign, Settings, TrendingUp, ShieldAlert, Save } from 'lucide-react'
import api from '../services/api'
import { toast } from 'sonner'

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, requests: 0, bids: 0, payments: 0 })
  const [config, setConfig] = useState({ seguro_porcentaje: '5', comision_logibid: '15' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [u, r, b, p, cfg] = await Promise.all([
        api.get('/users').catch(() => ({data:[]})),
        api.get('/requests').catch(() => ({data:[]})),
        api.get('/bids').catch(() => ({data:[]})),
        api.get('/payments').catch(() => ({data:[]})),
        api.get('/system-config').catch(() => ({data: [{key:'seguro_porcentaje', value:'5'}, {key:'comision_logibid', value:'15'}]}))
      ])
      setStats({
        users: u.data.length || 0,
        requests: r.data.length || 0,
        bids: b.data.length || 0,
        payments: p.data.length || 0
      })
      
      const configObj = {}
      cfg.data.forEach(item => { configObj[item.key] = item.value })
      setConfig(prev => ({ ...prev, ...configObj }))
    } catch (e) {
      toast.error('Error cargando estadísticas')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async (e) => {
    e.preventDefault()
    try {
      await api.post('/system-config', config).catch(() => {})
      toast.success('Configuración Guardada')
    } catch (e) {
      toast.error('Error al guardar config')
    }
  }

  const menu = [
    { label: 'Gestión de Usuarios', path: '/admin/users', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100', count: stats.users },
    { label: 'Gestión de Solicitudes', path: '/admin/requests', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100', count: stats.requests },
    { label: 'Gestión de Ofertas', path: '/admin/bids', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100', count: stats.bids },
    { label: 'Gestión de Pagos', path: '/admin/payments', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', count: stats.payments },
  ]

  return (
    <div className="min-h-screen bg-gray-100/50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-purple-900 rounded-2xl p-8 mb-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex items-center gap-4 mb-6 md:mb-0">
            <Settings className="w-10 h-10 text-purple-300" />
            <div>
              <h1 className="text-3xl font-bold">Panel de Administración de LogiBid</h1>
              <p className="text-purple-200 mt-2">Visión general y gestión integral de la plataforma de transporte.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {menu.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link to={item.path} className="block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-gray-50 text-gray-700 text-sm font-bold px-3 py-1 rounded-full">{loading ? '-' : item.count} totales</div>
                <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{item.label}</h3>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">Ver registros <TrendingUp className="w-3 h-3"/></p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Módulo de Configuración de Seguros y Comisiones */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-orange-500" /> Configuración Global de Primas y Seguros
          </h2>
          <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje de Seguro (%)</label>
              <div className="relative">
                 <input type="number" step="0.1" value={config.seguro_porcentaje} onChange={e => setConfig({ ...config, seguro_porcentaje: e.target.value })} className="w-full pl-4 pr-8 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20" />
                 <span className="absolute right-4 top-3 font-bold text-gray-400">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Cargo visible para el cliente</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comisión LogiBid (%)</label>
              <div className="relative">
                 <input type="number" step="0.1" value={config.comision_logibid} onChange={e => setConfig({ ...config, comision_logibid: e.target.value })} className="w-full pl-4 pr-8 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20" />
                 <span className="absolute right-4 top-3 font-bold text-gray-400">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Deducción para cálculo neto del transportista</p>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 transition-colors">
                <Save className="w-5 h-5"/> Guardar Cambios
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  )
}
export default AdminDashboard
