import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Truck, Menu, X, LogOut, User as UserIcon, LayoutDashboard, FileText, CreditCard, Shield } from 'lucide-react'

const Header = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const baseLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Solicitudes', path: '/requests', icon: FileText },
    { name: 'Pagos', path: '/payments', icon: CreditCard },
  ]
  
  const adminLinks = [
    { name: 'Panel Admin', path: '/admin', icon: Shield },
    { name: 'Usuarios', path: '/admin/users', icon: UserIcon },
    { name: 'Solicitudes', path: '/admin/requests', icon: FileText },
    { name: 'Ofertas', path: '/admin/bids', icon: FileText },
    { name: 'Pagos', path: '/admin/payments', icon: CreditCard },
  ]

  const links = user?.role === 'admin' ? adminLinks : baseLinks

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white px-4 sm:px-6 lg:px-8 border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 group">
            <div className={`w-10 h-10 ${user?.role === 'admin' ? 'bg-purple-100' : 'bg-primary/10'} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
              {user?.role === 'admin' ? <Shield className="w-6 h-6 text-purple-600" /> : <Truck className="w-6 h-6 text-primary" />}
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">LogiBid</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.path) ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:text-primary hover:bg-gray-50'}`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
            <div className={`w-8 h-8 ${user?.role === 'admin' ? 'bg-purple-600' : 'bg-primary'} rounded-full flex items-center justify-center shadow-sm`}>
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col pr-2">
              <span className="text-sm font-semibold text-gray-900 leading-tight">{user?.name}</span>
              <span className="text-xs text-gray-500 capitalize">{user?.role === 'driver' ? 'Transportista' : user?.role === 'admin' ? 'Administrador' : 'Cliente'}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-4 md:hidden">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 py-4 absolute top-16 left-0 w-full bg-white shadow-lg space-y-1 px-4">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${isActive(link.path) ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            )
          })}
          <div className="pt-4 mt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-4 py-2 mb-4">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
                <span className="text-xs text-gray-500 capitalize">{user?.role === 'driver' ? 'Transportista' : user?.role === 'admin' ? 'Administrador' : 'Cliente'}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Header
