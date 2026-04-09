import Header from '../components/Layout/Header'
import RequestList from '../components/Admin/RequestList'

const AdminRequestsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100/50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Solicitudes</h1>
          <p className="text-gray-500 text-sm">Monitorea y modera las solicitudes de transporte globalmente.</p>
        </div>
        <RequestList />
      </main>
    </div>
  )
}
export default AdminRequestsPage
