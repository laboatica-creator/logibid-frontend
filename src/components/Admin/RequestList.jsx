import { useState, useEffect } from 'react'
import api from '../../services/api'
import { toast } from 'sonner'

const RequestList = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/requests')
      setRequests(res.data)
    } catch (error) {
      toast.error('Error cargando solicitudes')
    } finally {
      setLoading(false)
    }
  }

  const deleteRequest = async (id) => {
    if (!confirm('¿Eliminar esta solicitud?')) return
    try {
      await api.delete(`/admin/requests/${id}`)
      toast.success('Solicitud eliminada')
      fetchRequests()
    } catch (error) {
      toast.error('Error eliminando solicitud')
    }
  }

  if (loading) return <div className="text-center py-8">Cargando solicitudes...</div>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-xl overflow-hidden shadow">
        <thead className="bg-gray-100">
          <tr><th className="px-4 py-3 text-left">Origen</th><th className="px-4 py-3 text-left">Destino</th><th className="px-4 py-3 text-left">Presupuesto</th><th className="px-4 py-3 text-left">Estado</th><th className="px-4 py-3 text-left">Cliente</th><th className="px-4 py-3 text-left">Acciones</th></tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id} className="border-t">
              <td className="px-4 py-3">{req.pickup_address}</td>
              <td className="px-4 py-3">{req.delivery_address}</td>
              <td className="px-4 py-3">${req.budget}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  req.status === 'assigned' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {req.status}
                </span>
              </td>
              <td className="px-4 py-3">{req.client_name || req.client_id}</td>
              <td className="px-4 py-3">
                <button onClick={() => deleteRequest(req.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default RequestList