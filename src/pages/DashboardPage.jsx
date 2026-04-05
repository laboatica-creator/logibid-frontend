import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'

const DashboardPage = () => {
  const { user, logout } = useAuth()

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
                <Link to="/payments" className="text-gray-700 hover:text-gray-900 px-3 py-2">Pagos</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.name} ({user?.role})</span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Bienvenido, {user?.name}</h2>
            <p className="text-gray-600 mb-4">
              {user?.role === 'client' 
                ? 'Crea solicitudes de transporte y recibe ofertas de transportistas.'
                : 'Encuentra solicitudes de transporte disponibles y realiza ofertas.'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {user?.role === 'client' ? (
                <Link to="/requests" className="bg-blue-500 text-white p-4 rounded-lg text-center hover:bg-blue-600">
                  Crear Nueva Solicitud
                </Link>
              ) : (
                <Link to="/requests" className="bg-green-500 text-white p-4 rounded-lg text-center hover:bg-green-600">
                  Ver Solicitudes Disponibles
                </Link>
              )}
              
              <Link to="/payments" className="bg-gray-500 text-white p-4 rounded-lg text-center hover:bg-gray-600">
                Ver Historial de Pagos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage