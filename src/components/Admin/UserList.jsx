import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Trash2, User, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

const UserList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users')
      setUsers(data || [])
    } catch (e) {
      toast.error('Error al cargar usuarios')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if(!window.confirm('¿Seguro que deseas eliminar este usuario defitivamente?')) return
    try {
      await api.delete(`/users/${id}`)
      toast.success('Usuario eliminado')
      fetchUsers()
    } catch(e) {
      toast.error('Error eliminando usuario')
    }
  }

  const handleChangeRole = async (id, newRole) => {
    if(!window.confirm(`¿Cambiar rol a ${newRole}?`)) return
    try {
      await api.put(`/users/${id}/role`, { role: newRole })
      toast.success('Rol actualizado con éxito')
      fetchUsers()
    } catch(e) {
      toast.error('Error al cambiar de rol')
    }
  }

  if (loading) return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent flex items-center justify-center mx-auto rounded-full animate-spin"></div></div>

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
              <th className="p-3">ID</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Email</th>
              <th className="p-3">Fecha Registro</th>
              <th className="p-3 text-center">Gestión de Rol</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="p-3 text-sm text-gray-400">#{u.id}</td>
                <td className="p-3 font-medium text-gray-900">{u.name || (u.email.split('@')[0])}</td>
                <td className="p-3 text-sm text-gray-600">{u.email}</td>
                <td className="p-3 text-xs text-gray-500">{new Date(u.created_at || Date.now()).toLocaleDateString()}</td>
                <td className="p-3 text-center">
                  <div className="relative inline-block">
                    <select 
                      value={u.role} 
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      className="appearance-none font-semibold text-xs border border-gray-200 bg-gray-50 text-gray-700 py-1.5 pl-3 pr-8 rounded-lg focus:ring-1 focus:ring-primary cursor-pointer hover:bg-white"
                    >
                      <option value="client">Client</option>
                      <option value="driver">Driver</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => handleDelete(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-500">No hay usuarios registrados</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default UserList
