import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import { Link } from 'react-router-dom'

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
    if (!confirm('¿Liberar el pago al transportista?')) return
    try {
      await api.post('/payments/release', { paymentId })
      alert('Pago liberado correctamente')
      fetchPayments()
    } catch (error) {
      console.error('Error releasing payment:', error)
      alert('Error al liberar el pago')
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      held: 'bg-blue-100 text-blue-800',
      released: 'bg-green-100 text-green-800',
      refunded: 'bg-red-100 text-red-800'
    }
    const labels = {
      pending: 'Pendiente',
      held: 'Retenido',
      released: 'Liberado',
      refunded: 'Reembolsado'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    )
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">LogiBid</h1>
              <div className="ml-10 flex space-x-4">
                <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 px-3 py-2">Dashboard</Link>
                <Link to="/requests" className="text-gray-700 hover:text-gray-900 px-3 py-2">Solicitudes</Link>
                <Link to="/payments" className="text-gray-900 font-medium px-3 py-2">Pagos</Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700">{user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Historial de Pagos</h2>
            
            {payments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay pagos registrados</p>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">
                          {payment.pickup_address} → {payment.delivery_address}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Monto: ${payment.amount} | {getStatusBadge(payment.status)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Cliente: {payment.client_name} | Transportista: {payment.driver_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Creado: {new Date(payment.created_at).toLocaleDateString()}
                          {payment.released_at && ` | Liberado: ${new Date(payment.released_at).toLocaleDateString()}`}
                        </p>
                      </div>
                      {user?.role === 'client' && payment.status === 'held' && (
                        <button
                          onClick={() => releasePayment(payment.id)}
                          className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
                        >
                          Liberar Pago
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentsPage