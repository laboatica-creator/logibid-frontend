import { useState, useEffect } from 'react'
import api from '../../services/api'
import { toast } from 'sonner'

const UserList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data)
    } catch (error) {
      toast.error('Error cargando usuarios')
    } finally {
      setLoading(false)
    }
  }

  const updateRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      toast.success('Rol actualizado')
      fetchUsers()
    } catch (error) {
      toast.error('Error actualizando rol')
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      await api.delete(`/admin/users/${userId}`)
      toast.success('Usuario eliminado')
      fetchUsers()
    } catch (error) {
      toast.error('Error eliminando usuario')
    }
  }

  if (loading) return <div className="text-center py-8">Cargando usuarios...</div>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-xl overflow-hidden shadow">
        <thead className="bg-gray-100">
          <tr><th className="px-4 py-3 text-left">Nombre</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Rol</th><th className="px-4 py-3 text-left">Acciones</th></tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-t">
              <td className="px-4 py-3">{user.name}</td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">
                <select value={user.role} onChange={(e) => updateRole(user.id, e.target.value)} className="border rounded px-2 py-1">
                  <option value="client">Cliente</option>
                  <option value="driver">Transportista</option>
                  <option value="admin">Administrador</option>
                </select>
              </td>
              <td className="px-4 py-3">
                <button onClick={() => deleteUser(user.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default UserList