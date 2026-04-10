import ErrorBoundary from '../components/ErrorBoundary'
import { useState, useEffect } from 'react'
import Header from '../components/Layout/Header'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Users, FileText, DollarSign, Settings, TrendingUp, ShieldAlert, Save, BarChart3, Map as MapIcon, Receipt } from 'lucide-react'
import api from '../services/api'
import { toast } from 'sonner'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const greenIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
const redIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
const blueIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

import { io } from 'socket.io-client';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, requests: 0, activeRequests: [], bids: 0, payments: 0 })
  const [config, setConfig] = useState({ seguro_porcentaje: '5', comision_logibid: '15', iva_porcentaje: '13', dias_liquidacion: '7', email_facturacion: 'admin@logibid.com' })
  const [loading, setLoading] = useState(true)
  const [activeDrivers, setActiveDrivers] = useState({})

  useEffect(() => {
    fetchStats()
    
    const socket = io('https://logibid-api.onrender.com')
    socket.on('driver-location-update', (data) => {
       setActiveDrivers(prev => ({ ...prev, [data.driver_id]: data }))
    })

    return () => socket.disconnect()
  }, [])

  const fetchStats = async () => {
    try {
      const [u, r, b, p, cfg] = await Promise.all([
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/admin/requests').catch(() => ({ data: [] })),
        api.get('/admin/bids').catch(() => ({ data: [] })),
        api.get('/admin/payments').catch(() => ({ data: [] })),
        api.get('/admin/system-config').catch(() => ({ data: [] }))
      ])
      
      const requests = r.data || []
      const actives = requests.filter(req => req.status !== 'completed' && req.status !== 'cancelled')

      setStats({
        users: u.data.length || 0,
        requests: requests.length || 0,
        activeRequests: actives,
        bids: b.data.length || 0,
        payments: p.data.length || 0
      })
      
      const configObj = {}
      cfg.data.forEach(item => { configObj[item.key] = item.value })
      setConfig(prev => ({ ...prev, ...configObj }))
    } catch (e) {
      toast.error('Error cargando estadísticas')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/system-config', config).catch(() => {})
      toast.success('Configuración Guardada')
    } catch (e) {
      toast.error('Error al guardar config')
    }
  }

  const menu = [
    { label: 'Gestión de Usuarios', path: '/admin/users', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100', count: stats.users },
    { label: 'Gestión de Solicitudes', path: '/admin/requests', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100', count: stats.requests },
    { label: 'Gestión de Ofertas', path: '/admin/bids', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100', count: stats.bids },
    { label: 'Gestión de Pagos', path: '/admin/payments', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', count: stats.payments },
    { label: 'Reportes Financieros', path: '/admin/reports', icon: BarChart3, color: 'text-pink-600', bg: 'bg-pink-100', count: 'PDF' },
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100/50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-purple-900 rounded-2xl p-8 mb-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex items-center gap-4 mb-6 md:mb-0">
              <Settings className="w-10 h-10 text-purple-300" />
              <div>
                <h1 className="text-3xl font-bold">Panel de Administración de LogiBid</h1>
                <p className="text-purple-200 mt-2">Visión general y gestión integral de la plataforma de transporte y facturación.</p>
              </div>
            </div>
            <Link to="/admin/reports" className="relative z-10 bg-white text-purple-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 flex items-center gap-2">
               <Receipt className="w-5 h-5"/> Módulo de Reportes
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {menu.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link to={item.path} className="block bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/50 transition-all group relative overflow-hidden h-full">
                  <div className="absolute top-4 right-4 bg-gray-50 text-gray-700 text-xs font-bold px-2 py-1 rounded-md">{loading ? '-' : item.count} totales</div>
                  <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight mb-1">{item.label}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">Administrar <TrendingUp className="w-3 h-3"/></p>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
             {/* Mapa Global De Solicitudes en Tiempo Real */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapIcon className="w-6 h-6 text-blue-500" /> Mapa Táctico de Flota y Cargas Activas
                </h2>
                <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-gray-200">
                  <MapContainer center={[9.9281, -84.0907]} zoom={9} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                    {/* Active Requests Pickups and Deliveries */}
                    {stats.activeRequests.map(req => {
                      const pickupMatch = req.pickup_address.match(/-?\d+\.\d+/g);
                      const deliveryMatch = req.delivery_address.match(/-?\d+\.\d+/g);
                      return (
                        <div key={`req-markers-${req.id}`}>
                           {pickupMatch && pickupMatch.length>=2 && <Marker position={[parseFloat(pickupMatch[0]), parseFloat(pickupMatch[1])]} icon={greenIcon}><Popup>RECOGIDA: #{req.id.substring(0,8)}</Popup></Marker>}
                           {deliveryMatch && deliveryMatch.length>=2 && <Marker position={[parseFloat(deliveryMatch[0]), parseFloat(deliveryMatch[1])]} icon={redIcon}><Popup>ENTREGA: #{req.id.substring(0,8)}</Popup></Marker>}
                        </div>
                      )
                    })}
                    {/* Active Drivers */}
                    {Object.values(activeDrivers).map(driver => (
                       <Marker key={`driver-${driver.driver_id}`} position={[driver.lat, driver.lng]} icon={blueIcon}>
                          <Popup>Transportista en Servicio</Popup>
                       </Marker>
                    ))}
                  </MapContainer>
                </div>
             </div>

            {/* Módulo de Configuración Modular */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <ShieldAlert className="w-6 h-6 text-orange-500" /> Plataforma de Facturación y Seguros
              </h2>
              <form onSubmit={handleSaveConfig} className="space-y-5">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 pointer-events-auto">Porcentaje Seguro (%)</label>
                    <input type="number" step="0.1" value={config.seguro_porcentaje} onChange={e => setConfig({ ...config, seguro_porcentaje: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Comisión LogiBid (%)</label>
                    <input type="number" step="0.1" value={config.comision_logibid} onChange={e => setConfig({ ...config, comision_logibid: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">IVA Facturación (%)</label>
                    <input type="number" step="0.1" value={config.iva_porcentaje} onChange={e => setConfig({ ...config, iva_porcentaje: e.target.value })} className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 text-sm focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Ciclo Liquidación (Días)</label>
                    <input type="number" value={config.dias_liquidacion} onChange={e => setConfig({ ...config, dias_liquidacion: e.target.value })} className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 text-sm focus:border-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Facturación por Defecto</label>
                  <input type="email" value={config.email_facturacion} onChange={e => setConfig({ ...config, email_facturacion: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm" />
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 transition-colors">
                    <Save className="w-5 h-5"/> Guardar Configuración Global
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default AdminDashboard