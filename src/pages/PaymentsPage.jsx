import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import { motion } from 'framer-motion'
import { CreditCard, ArrowRight, User, Hash, Calendar, CheckCircle } from 'lucide-react'
import Header from '../components/Layout/Header'

const PaymentsPage = () => {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments/user')
      setPayments(response.data)
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const releasePayment = async (paymentId) => {
    if (!window.confirm('¿Liberar el pago al transportista? Esta acción no se puede deshacer.')) return
    try {
      await api.post('/payments/release', { paymentId })
      // Mostrar notificacion bonita aquí si hubiera.
      fetchPayments()
    } catch (error) {
      console.error('Error releasing payment:', error)
      alert('Error al liberar el pago')
    }
  }

  const getStatusBadge = (status) => {
    const configs = {
      pending: { css: 'bg-yellow-50 border-yellow-200 text-yellow-700', label: 'Pendiente' },
      held: { css: 'bg-blue-50 border-blue-200 text-blue-700', label: 'Retenido' },
      released: { css: 'bg-green-50 border-green-200 text-green-700', label: 'Liberado' },
      refunded: { css: 'bg-red-50 border-red-200 text-red-700', label: 'Reembolsado' }
    }
    const { css, label } = configs[status] || { css: 'bg-gray-50 border-gray-200 text-gray-700', label: status }
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${css}`}>
        {label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100/50 pb-12">
      <Header />

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center gap-3 mb-8 px-4 sm:px-0">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Historial de Pagos</h2>
            <p className="text-sm text-gray-500 mt-1">Revisa el estado de tus transacciones</p>
          </div>
        </div>

        <div className="px-4 sm:px-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sm:p-4">
            {payments.length === 0 ? (
              <div className="text-center py-16">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No hay pagos registrados</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {payments.map((payment, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.05 }}
                    key={payment.id} 
                    className="p-4 sm:p-6 hover:bg-gray-50/50 transition-colors rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="text-xs font-bold text-gray-400 font-mono tracking-wider flex items-center"><Hash className="w-3 h-3 mr-0.5" />{payment.id}</span>
                        {getStatusBadge(payment.status)}
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-900 font-medium mb-3">
                        <span className="truncate max-w-[120px] sm:max-w-xs">{payment.pickup_address}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate max-w-[120px] sm:max-w-xs">{payment.delivery_address}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-lg">
                          <User className="w-3.5 h-3.5" /> {user?.role === 'client' ? `Transp: ${payment.driver_name}` : `Cliente: ${payment.client_name}`}
                        </div>
                        <div className="flex items-center gap-1.5 border border-gray-100 px-2 py-1 rounded-lg">
                          <Calendar className="w-3.5 h-3.5" /> 
                          {new Date(payment.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                      <div className="text-left md:text-right">
                        <span className="text-xs font-bold text-gray-400 block sm:hidden">MONTO</span>
                        <h3 className="text-2xl font-bold text-gray-900"><span className="text-gray-400 mr-1">$</span>{Number(payment.amount).toLocaleString('es-CR')}</h3>
                      </div>

                      {user?.role === 'client' && payment.status === 'held' && (
                        <div className="mt-0 md:mt-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => releasePayment(payment.id)}
                            className="bg-success text-white font-bold px-4 py-2 rounded-xl text-sm shadow-sm shadow-success/20 hover:bg-emerald-600 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" /> Liberar Pago
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default PaymentsPage