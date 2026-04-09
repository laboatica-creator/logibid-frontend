import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Clock, CreditCard, ArrowRight, TrendingUp, Package } from 'lucide-react'
import Header from '../components/Layout/Header'
import api from '../services/api'

const DashboardPage = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({ requests: 0, active: 0, payments: 0 })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [reqRes, payRes] = await Promise.all([
          api.get('/requests'),
          api.get('/payments/user')
        ])
        
        const requests = reqRes.data || []
        const payments = payRes.data || []
        
        setStats({
          requests: requests.length,
          active: requests.filter(r => r.status === 'in_progress' || r.status === 'assigned' || r.status === 'pending').length,
          payments: payments.filter(p => p.status === 'released' || p.status === 'held').length
        })

        // recent requests
        setRecentActivity(requests.slice(0, 3))
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role !== 'admin') {
      fetchDashboardData()
    } else {
      setLoading(false)
    }
  }, [user])

  return (
    <div className="min-h-screen bg-gray-100/50 pb-12">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                ¡Hola, {user?.name}! 👋
              </h1>
              <p className="text-gray-500 mt-1">
                {user?.role === 'client' 
                  ? 'Aquí tienes un resumen de tus solicitudes de transporte.'
                  : user?.role === 'admin' 
                    ? 'Bienvenido al panel administrativo.' 
                    : 'Revisa las nuevas oportunidades de viaje disponibles.'}
              </p>
            </div>
            <div className="flex gap-3">
              {user?.role === 'client' && (
                <Link to="/requests" className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-2">
                  Nueva Solicitud <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {user?.role !== 'admin' && (
          <>
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-gray-500 font-medium text-sm">Total Solicitudes</h3>
                  <div className="text-3xl font-bold text-gray-900 mt-1">{loading ? '--' : stats.requests}</div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-110 transition-transform"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-orange-100 text-secondary rounded-xl flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-gray-500 font-medium text-sm">Activas o En Proceso</h3>
                  <div className="text-3xl font-bold text-gray-900 mt-1">{loading ? '--' : stats.active}</div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full group-hover:scale-110 transition-transform"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h3 className="text-gray-500 font-medium text-sm">Pagos Registrados</h3>
                  <div className="text-3xl font-bold text-gray-900 mt-1">{loading ? '--' : stats.payments}</div>
                </div>
              </motion.div>
            </div>

            {/* Quick actions / recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Solicitudes Recientes
                </h3>
                
                {loading ? (
                  <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">Cargando...</p>
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm mb-4">Aún no tienes solicitudes. ¡Crea una!</p>
                    {user?.role === 'client' && (
                       <Link to="/requests" className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold">
                         Crear mi primera solicitud
                       </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map(req => (
                      <div key={req.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Package className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold truncate max-w-[200px]">{req.pickup_address} → {req.delivery_address}</p>
                            <p className="text-xs text-gray-500">${req.budget} • {req.weight_kg}kg</p>
                          </div>
                        </div>
                        <Link to={`/requests/${req.id}`} className="text-primary hover:text-primary-dark">
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ))}
                    <Link to="/requests" className="block text-center text-sm font-semibold text-primary pt-2 hover:underline">
                      Ver todas ( {stats.requests} )
                    </Link>
                  </div>
                )}
              </motion.div>
              
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-lg border border-primary p-8 text-white relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">{user?.role === 'client' ? '¿Necesitas enviar mercancía?' : 'Encuentra cargas hoy'}</h3>
                  <p className="text-blue-100 mb-6">Explora las solicitudes disponibles y conecta con {user?.role === 'client' ? 'los mejores transportistas' : 'clientes de confianza'} rápidamente.</p>
                  
                  <Link to="/requests" className="inline-block bg-white text-primary px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all">
                    Ir a Solicitudes
                  </Link>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default DashboardPage