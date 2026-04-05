import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import { Link } from 'react-router-dom'

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
    } catch (error) {
      console.error('Error creating request:', error)
      alert('Error al crear la solicitud')
    }
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
                <Link to="/requests" className="text-gray-900 font-medium px-3 py-2">Solicitudes</Link>
                <Link to="/payments" className="text-gray-700 hover:text-gray-900 px-3 py-2">Pagos</Link>
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {user?.role === 'client' ? 'Mis Solicitudes' : 'Solicitudes Disponibles'}
            </h2>
            {user?.role === 'client' && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {showForm ? 'Cancelar' : 'Nueva Solicitud'}
              </button>
            )}
          </div>

          {showForm && user?.role === 'client' && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Crear Nueva Solicitud</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección de Recogida</label>
                  <input
                    type="text"
                    name="pickup_address"
                    value={formData.pickup_address}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección de Entrega</label>
                  <input
                    type="text"
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                    <input
                      type="number"
                      name="weight_kg"
                      value={formData.weight_kg}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Presupuesto ($)</label>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Crear Solicitud
                </button>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {requests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay solicitudes disponibles</p>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">📦 {request.pickup_address} → {request.delivery_address}</p>
                      <p className="text-sm text-gray-600 mt-1">Descripción: {request.description || 'Sin descripción'}</p>
                      <p className="text-sm text-gray-600">Peso: {request.weight_kg} kg | Presupuesto: ${request.budget}</p>
                      <p className="text-sm text-gray-500 mt-1">Cliente: {request.client_name}</p>
                    </div>
                    {user?.role === 'driver' && request.status === 'pending' && (
                      <Link
                        to={`/requests/${request.id}`}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Hacer Oferta
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequestsPage