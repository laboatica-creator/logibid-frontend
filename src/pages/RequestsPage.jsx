import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, MapPin, Package, DollarSign, Plus, X, ArrowRight, User as UserIcon, Clock } from 'lucide-react'
import Header from '../components/Layout/Header'
import { toast } from 'sonner'

const RequestsPage = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    pickup_address: '',
    delivery_address: '',
    description: '',
    weight_kg: '',
    budget: ''
  })

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests')
      setRequests(response.data)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/requests', formData)
      setShowForm(false)
      setFormData({
        pickup_address: '',
        delivery_address: '',
        description: '',
        weight_kg: '',
        budget: ''
      })
      fetchRequests()
      toast.success('Solicitud creada con éxito')
    } catch (error) {
      console.error('Error creating request:', error)
      toast.error('Error al crear la solicitud')
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta solicitud?')) return;
    try {
      await api.delete(`/requests/${id}`);
      toast.success('Solicitud cancelada');
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error('Error al cancelar solicitud');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> Pendiente</span>;
      case 'assigned': return <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-semibold">Asignada</span>;
      case 'completed': return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-semibold">Completada</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-xs font-semibold">{status || 'pending'}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100/50 pb-12">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {user?.role === 'client' ? 'Mis Solicitudes' : 'Oportunidades de Viaje'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {requests.length} solicitudes encontradas
            </p>
          </div>
          {user?.role === 'client' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-colors ${showForm ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' : 'bg-primary text-white hover:bg-primary-dark shadow-primary/20'}`}
            >
              {showForm ? <><X className="w-4 h-4" /> Cancelar</> : <><Plus className="w-4 h-4" /> Nueva Solicitud</>}
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {showForm && user?.role === 'client' && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl shadow-primary/5 border border-gray-100 p-6 md:p-8 mb-8 overflow-hidden"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Truck className="w-6 h-6 text-primary" /> Crear Solicitud de Carga
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Origen (Recogida)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="pickup_address"
                        value={formData.pickup_address}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-gray-50 focus:bg-white"
                        placeholder="Ej. Almacén Central, San José"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Destino (Entrega)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                      <input
                        type="text"
                        name="delivery_address"
                        value={formData.delivery_address}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-gray-50 focus:bg-white"
                        placeholder="Ej. Tienda Norte, Heredia"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Detalles de la Carga</label>
                  <div className="relative">
                    <Package className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-gray-50 focus:bg-white resize-none"
                      rows="3"
                      placeholder="Ej. 10 cajas de repuestos electrónicos, frágil."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Peso Estimado (kg)</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="weight_kg"
                        value={formData.weight_kg}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-gray-50 focus:bg-white"
                        step="0.01"
                        placeholder="0.00"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">KG</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Presupuesto Sugerido</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
                      <input
                        type="number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-gray-50 focus:bg-white font-semibold text-gray-900"
                        step="0.01"
                        required
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex items-center gap-2 bg-success text-white px-8 py-3 rounded-xl font-bold shadow-sm shadow-success/20 hover:bg-emerald-600 transition-colors"
                  >
                    Publicar Solicitud <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {requests.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium">Aún no hay solicitudes disponibles</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requests.map((request, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={request.id} 
                  className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 hover:border-gray-200 transition-all p-5 md:p-6 group flex flex-col lg:flex-row gap-6"
                >
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary/10 p-2.5 rounded-xl">
                          <Truck className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(request.status)}
                          <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">Ref: #{String(request.id).padStart(4, '0')}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mb-4">
                        <div className="flex-1">
                          <span className="text-xs font-medium text-gray-400 block mb-1">RECOGIDA</span>
                          <p className="font-semibold text-gray-900">{request.pickup_address}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 hidden md:block" />
                        <div className="flex-1">
                          <span className="text-xs font-medium text-gray-400 block mb-1">ENTREGA</span>
                          <p className="font-semibold text-gray-900">{request.delivery_address}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-3 flex flex-wrap items-center gap-4 text-sm mt-2">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <UserIcon className="w-4 h-4 text-primary/60" /> 
                        <span className="truncate max-w-[120px]">{request.client_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Package className="w-4 h-4 text-primary/60" /> 
                        {request.weight_kg ? `${request.weight_kg} kg` : 'N/A'}
                      </div>
                      <div className="text-gray-500 italic max-w-sm truncate whitespace-nowrap overflow-hidden">
                        {request.description || 'Sin descripción adicional'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 min-w-[200px] gap-2">
                    <div className="text-left lg:text-center mb-0 lg:mb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Presupuesto</span>
                      <div className="text-2xl font-bold text-gray-900 flex items-center justify-start lg:justify-center">
                        <span className="text-success mr-1">$</span>{Number(request.budget).toLocaleString('es-CR')}
                      </div>
                    </div>
                    
                    <Link
                      to={`/requests/${request.id}`}
                      className="bg-gray-100 text-gray-700 font-bold px-6 py-2 rounded-xl border border-gray-200 hover:bg-gray-200 transition-all text-center flex items-center justify-center gap-2 group/btn whitespace-nowrap w-full"
                    >
                      Ver Detalles
                    </Link>

                    {user?.role === 'client' && request.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(request.id)}
                        className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white font-bold px-6 py-2 rounded-xl transition-all text-center flex items-center justify-center gap-2 whitespace-nowrap w-full mt-1 border border-red-100"
                      >
                        <X className="w-4 h-4" /> Cancelar
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default RequestsPage