import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Clock, CreditCard, ArrowRight, TrendingUp, Package, Plus } from 'lucide-react'
import Header from '../components/Layout/Header'
import api from '../services/api'
import { useLanguage } from '../context/LanguageContext'

const DashboardPage = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [stats, setStats] = useState({ requests: 0, active: 0, payments: 0 })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [reqRes, payRes] = await Promise.all([
          api.get('/requests'),
          api.get('/payments/user').catch(() => ({ data: [] }))
        ])
        
        const requests = reqRes.data || []
        const payments = payRes.data || []
        
        setStats({
          requests: requests.length,
          active: requests.filter(r => r.status === 'in_progress' || r.status === 'assigned' || r.status === 'pending').length,
          payments: payments.filter(p => p.status === 'released' || p.status === 'held').length
        })

        setRecentActivity(requests.slice(0, 3))
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role !== 'admin') fetchDashboardData()
    else setLoading(false)
  }, [user])

  return (
    <div className="min-h-screen bg-gray-100/50 pb-12 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mt-16" />
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5" style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v5h-3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>')`, backgroundSize: '150px' }} />

      <div className="relative z-10">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {t('dashboard.welcome')}, <span className="text-primary">{user?.name}</span> 👋
              </h1>
              <p className="text-gray-500 mt-1 font-medium">{t(`register.${user?.role}`)} - {t('dashboard.title')}</p>
            </div>
            
            {user?.role === 'client' && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/requests" className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                  <Plus className="w-5 h-5" /> {t('dashboard.new_request')}
                </Link>
              </motion.div>
            )}
          </motion.div>

          {user?.role !== 'admin' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Package className="w-6 h-6" /></div>
                    <h3 className="text-gray-500 font-medium text-sm">{t('requests.title')}</h3>
                    <div className="text-3xl font-bold text-gray-900 mt-1">{loading ? '--' : stats.requests}</div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-110 transition-transform"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-orange-100 text-secondary rounded-xl flex items-center justify-center mb-4"><Clock className="w-6 h-6" /></div>
                    <h3 className="text-gray-500 font-medium text-sm">{t('dashboard.active_requests')}</h3>
                    <div className="text-3xl font-bold text-gray-900 mt-1">{loading ? '--' : stats.active}</div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full group-hover:scale-110 transition-transform"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4"><CreditCard className="w-6 h-6" /></div>
                    <h3 className="text-gray-500 font-medium text-sm">{t('payments.title')}</h3>
                    <div className="text-3xl font-bold text-gray-900 mt-1">{loading ? '--' : stats.payments}</div>
                  </div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Actividad Reciente
                  </h3>
                  
                  {loading ? (
                    <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-500 text-sm">Cargando...</p>
                    </div>
                  ) : recentActivity.length === 0 ? (
                    <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-500 text-sm mb-4">No hay actividad.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentActivity.map(req => (
                        <div key={req.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg"><Package className="w-4 h-4 text-primary" /></div>
                            <div>
                              <p className="text-sm font-semibold truncate max-w-[200px]">{req.pickup_address} → {req.delivery_address}</p>
                              <p className="text-xs text-gray-500">${req.budget}</p>
                            </div>
                          </div>
                          <Link to={`/requests/${req.id}`} className="text-primary hover:text-primary-dark"><ArrowRight className="w-4 h-4" /></Link>
                        </div>
                      ))}
                      <Link to="/requests" className="block text-center text-sm font-semibold text-primary pt-2 hover:underline">
                        {t('dashboard.view_all')}
                      </Link>
                    </div>
                  )}
                </motion.div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default DashboardPage