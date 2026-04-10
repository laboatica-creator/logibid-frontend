import { useState, useEffect } from 'react'
import api from '../../services/api'
import { toast } from 'sonner'

const PaymentList = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await api.get('/admin/payments')
      setPayments(res.data)
    } catch (error) {
      toast.error('Error cargando pagos')
    } finally {
      setLoading(false)
    }
  }

  const releasePayment = async (id) => {
    if (!confirm('¿Liberar este pago al transportista?')) return
    try {
      await api.post(`/admin/payments/${id}/release`)
      toast.success('Pago liberado')
      fetchPayments()
    } catch (error) {
      toast.error('Error liberando pago')
    }
  }

  const refundPayment = async (id) => {
    if (!confirm('¿Reembolsar este pago al cliente?')) return
    try {
      await api.post(`/admin/payments/${id}/refund`)
      toast.success('Pago reembolsado')
      fetchPayments()
    } catch (error) {
      toast.error('Error reembolsando pago')
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      held: 'bg-blue-100 text-blue-800',
      released: 'bg-green-100 text-green-800',
      refunded: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>{status}</span>
  }

  if (loading) return <div className="text-center py-8">Cargando pagos...</div>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-xl overflow-hidden shadow">
        <thead className="bg-gray-100">
          <tr><th className="px-4 py-3 text-left">Solicitud</th><th className="px-4 py-3 text-left">Cliente</th><th className="px-4 py-3 text-left">Transportista</th><th className="px-4 py-3 text-left">Monto</th><th className="px-4 py-3 text-left">Estado</th><th className="px-4 py-3 text-left">Acciones</th></tr>
        </thead>
        <tbody>
          {payments.map(payment => (
            <tr key={payment.id} className="border-t">
              <td className="px-4 py-3 text-sm">{payment.request_id?.substring(0, 8)}...</td>
              <td className="px-4 py-3">{payment.client_name || payment.client_id}</td>
              <td className="px-4 py-3">{payment.driver_name || payment.driver_id}</td>
              <td className="px-4 py-3 font-bold">${payment.amount}</td>
              <td className="px-4 py-3">{getStatusBadge(payment.status)}</td>
              <td className="px-4 py-3 space-x-2">
                {payment.status === 'held' && (
                  <button onClick={() => releasePayment(payment.id)} className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600">Liberar</button>
                )}
                {payment.status === 'held' && (
                  <button onClick={() => refundPayment(payment.id)} className="bg-orange-500 text-white px-2 py-1 rounded text-sm hover:bg-orange-600">Reembolsar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default PaymentList