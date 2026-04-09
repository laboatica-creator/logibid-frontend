import { useState, useEffect } from 'react'
import api from '../../services/api'
import { FileText, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const BidList = () => {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBids()
  }, [])

  const fetchBids = async () => {
    try {
      const { data } = await api.get('/bids')
      setBids(data || [])
    } catch (e) {
      toast.error('Error cargando ofertas de la DB')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if(!window.confirm('¿Borrar oferta forzosamente?')) return
    try {
      await api.delete(`/bids/${id}`)
      toast.success('Oferta eliminada')
      fetchBids()
    } catch(e) {
      toast.error('Error eliminando oferta')
    }
  }

  if (loading) return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent flex items-center justify-center mx-auto rounded-full animate-spin"></div></div>

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
              <th className="p-3">ID Oferta</th>
              <th className="p-3">ID Solicitud</th>
              <th className="p-3">Transportista ID</th>
              <th className="p-3 text-right">Monto Oferta</th>
              <th className="p-3 border-l border-gray-100 pl-4">Estado</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {bids.map(b => (
              <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="p-3 text-sm text-gray-400">#{b.id}</td>
                <td className="p-3 text-sm text-primary font-medium cursor-pointer hover:underline">#{b.request_id}</td>
                <td className="p-3 text-sm">{b.driver_id}</td>
                <td className="p-3 text-right font-bold text-gray-900">${b.amount}</td>
                <td className="p-3 border-l border-gray-100 pl-4 text-sm">
                  <span className={`px-2 py-1 rounded-lg ${b.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                    {b.status || 'pending'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => handleDelete(b.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
            {bids.length === 0 && <tr><td colSpan="6" className="p-4 text-center text-gray-500">No hay ofertas en el sistema</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default BidList
