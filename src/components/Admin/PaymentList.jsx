import { useState, useEffect } from 'react'
import api from '../../services/api'
import { CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

const PaymentList = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const { data } = await api.get('/payments') 
      setPayments(data || [])
    } catch (e) {
      toast.error('No se pudo conectar a los pagos')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action, id) => {
    const isRelease = action === 'release'
    if(!window.confirm(`¿Seguro que deseas ${isRelease ? 'liberar' : 'reembolsar'} este pago?`)) return
    try {
      await api.post(`/payments/${action}`, { payment_id: id })
      toast.success(isRelease ? 'Fondos liberados al transportista' : 'Reembolso ejecutado')
      fetchPayments()
    } catch(e) {
      toast.error(`Error al ejecutar acción sobre el pago`)
    }
  }

  if (loading) return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent flex items-center justify-center mx-auto rounded-full animate-spin"></div></div>

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
              <th className="p-3">ID Pago</th>
              <th className="p-3">ID Oferta Base</th>
              <th className="p-3 text-right">Monto (Escrow)</th>
              <th className="p-3 border-l border-gray-100 pl-4">Estado</th>
              <th className="p-3 text-right">Controles Retenidos</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="p-3 text-sm text-gray-400">#{p.id}</td>
                <td className="p-3 text-sm">#{p.bid_id}</td>
                <td className="p-3 text-right font-bold text-gray-900">${p.amount}</td>
                <td className="p-3 border-l border-gray-100 pl-4 text-sm">
                  <span className={`px-2 py-1 flex w-max items-center gap-1 rounded-lg ${p.status === 'released' ? 'bg-green-100 text-green-700' : p.status === 'refunded' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {p.status === 'held' || p.status === 'pending' ? (
                     <div className="flex justify-end gap-2">
                       <button onClick={() => handleAction('release', p.id)} className="px-3 py-1.5 flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors"><CheckCircle className="w-3 h-3"/> Liberar</button>
                       <button onClick={() => handleAction('refund', p.id)} className="px-3 py-1.5 flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"><XCircle className="w-3 h-3"/> Reembolso</button>
                     </div>
                  ) : <span className="text-xs text-gray-400 font-semibold px-2">Cerrado</span>}
                </td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">No se encontraron transacciones financieras</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default PaymentList
