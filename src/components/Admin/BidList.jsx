import { useState, useEffect } from 'react'
import api from '../../services/api'
import { toast } from 'sonner'

const BidList = () => {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBids()
  }, [])

  const fetchBids = async () => {
    try {
      const res = await api.get('/admin/bids')
      setBids(res.data)
    } catch (error) {
      toast.error('Error cargando ofertas')
    } finally {
      setLoading(false)
    }
  }

  const deleteBid = async (id) => {
    if (!confirm('¿Eliminar esta oferta?')) return
    try {
      await api.delete(`/admin/bids/${id}`)
      toast.success('Oferta eliminada')
      fetchBids()
    } catch (error) {
      toast.error('Error eliminando oferta')
    }
  }

  if (loading) return <div className="text-center py-8">Cargando ofertas...</div>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-xl overflow-hidden shadow">
        <thead className="bg-gray-100">
          <tr><th className="px-4 py-3 text-left">Solicitud ID</th><th className="px-4 py-3 text-left">Transportista</th><th className="px-4 py-3 text-left">Monto</th><th className="px-4 py-3 text-left">Estado</th><th className="px-4 py-3 text-left">Acciones</th></tr>
        </thead>
        <tbody>
          {bids.map(bid => (
            <tr key={bid.id} className="border-t">
              <td className="px-4 py-3 text-sm">{bid.request_id?.substring(0, 8)}...</td>
              <td className="px-4 py-3">{bid.driver_name || bid.driver_id}</td>
              <td className="px-4 py-3 font-bold">${bid.amount}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  bid.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {bid.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <button onClick={() => deleteBid(bid.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default BidList