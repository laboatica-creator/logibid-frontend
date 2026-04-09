import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Trash2, Filter } from 'lucide-react'
import { toast } from 'sonner'

const RequestList = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterMode, setFilterMode] = useState('all')

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/requests')
      setRequests(data || [])
    } catch (e) {
      toast.error('Error al cargar la tabla de solicitudes')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if(!window.confirm('¿Eliminar solicitud y todas sus relaciones?')) return
    try {
      await api.delete(`/requests/${id}`)
      toast.success('Solicitud eliminada')
      fetchRequests()
    } catch(e) {
      toast.error('No se pudo eliminar la solicitud')
    }
  }

  const filteredRequests = requests.filter(r => filterMode === 'all' ? true : r.status === filterMode)

  if (loading) return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent flex items-center justify-center mx-auto rounded-full animate-spin"></div></div>

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex gap-2 mb-4 p-2 bg-gray-50 rounded-lg w-max">
        <Filter className="w-5 h-5 text-gray-400 mr-2 mt-1" />
        <button onClick={()=>setFilterMode('all')} className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${filterMode==='all'?'bg-white text-primary shadow-sm':'text-gray-500'}`}>Todas</button>
        <button onClick={()=>setFilterMode('pending')} className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${filterMode==='pending'?'bg-white text-primary shadow-sm':'text-gray-500'}`}>Pendientes</button>
        <button onClick={()=>setFilterMode('assigned')} className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${filterMode==='assigned'?'bg-white text-primary shadow-sm':'text-gray-500'}`}>Asignadas</button>
        <button onClick={()=>setFilterMode('completed')} className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${filterMode==='completed'?'bg-white text-primary shadow-sm':'text-gray-500'}`}>Completadas</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
              <th className="p-3">ID</th>
              <th className="p-3">Ruta</th>
              <th className="p-3">Cliente ID</th>
              <th className="p-3">Presupuesto</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map(r => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="p-3 text-sm text-gray-400">#{r.id}</td>
                <td className="p-3 text-sm font-medium">{r.pickup_address} → {r.delivery_address}</td>
                <td className="p-3 text-sm text-gray-600">{r.client_id}</td>
                <td className="p-3 text-sm text-success font-semibold">${r.budget}</td>
                <td className="p-3 text-sm"><span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg">{r.status || 'pending'}</span></td>
                <td className="p-3 text-right">
                  <button onClick={() => handleDelete(r.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
            {filteredRequests.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-500">Ninguna solicitud coincide</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default RequestList
