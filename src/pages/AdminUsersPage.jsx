import Header from '../components/Layout/Header'
import UserList from '../components/Admin/UserList'

const AdminUsersPage = () => {
  return (
    <div className="min-h-screen bg-gray-100/50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500 text-sm">Administra los clientes y transportistas registrados en la plataforma.</p>
        </div>
        <UserList />
      </main>
    </div>
  )
}
export default AdminUsersPage
