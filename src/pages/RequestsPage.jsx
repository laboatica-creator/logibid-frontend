import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, MapPin, Package, DollarSign, Plus, X, ArrowRight, User as UserIcon, Bike, Tractor, Car, ArrowDownUp } from 'lucide-react'
import Header from '../components/Layout/Header'
import { toast } from 'sonner'
import RequestMap from '../components/Map/RequestMap'
import SearchBox from '../components/Map/SearchBox'
import RouteInfo from '../components/Map/RouteInfo'
import { calculateSuggestedPrice } from '../services/rateCalculator'
import { useLanguage } from '../context/LanguageContext'

const RequestsPage = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  const [originCoords, setOriginCoords] = useState(null)
  const [originName, setOriginName] = useState('')
  const [destCoords, setDestCoords] = useState(null)
  const [destName, setDestName] = useState('')
  const [mapMode, setMapMode] = useState('origin')
  
  const [routeLine, setRouteLine] = useState([])
  const [routeMeta, setRouteMeta] = useState(null)

  const [formData, setFormData] = useState({
    pickup_address: '',
    delivery_address: '',
    description: '',
    instructions: '',
    weight_kg: '',
    budget: '',
    vehicle_type: 'car',
    service_type: 'immediate',
    schedule_date: ''
  })

  useEffect(() => {
    fetchRequests()
  }, [])

  useEffect(() => {
    if (originCoords && destCoords) {
      const fetchRoute = async () => {
        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${originCoords[1]},${originCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`)
          const data = await res.json()
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0]
            const coords = route.geometry.coordinates.map(c => [c[1], c[0]])
            setRouteLine(coords)
            
            const dist = route.distance / 1000
            const dur = route.duration / 60
            setRouteMeta({ distance: dist, duration: dur })
            
            if (formData.weight_kg) {
              const sugg = calculateSuggestedPrice(dist, Number(formData.weight_kg), formData.vehicle_type)
              setFormData(prev => ({ ...prev, budget: sugg.toFixed(2), pickup_address: originName || `${originCoords[0].toFixed(4)}, ${originCoords[1].toFixed(4)}`, delivery_address: destName || `${destCoords[0].toFixed(4)}, ${destCoords[1].toFixed(4)}` }))
            }
          }
        } catch (err) {
          console.error("OSRM Error:", err)
        }
      }
      fetchRoute()
    } else {
      setRouteLine([])
      setRouteMeta(null)
    }
  }, [originCoords, destCoords, formData.weight_kg, formData.vehicle_type, originName, destName])

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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSwap = () => {
    const oC = originCoords, oN = originName
    setOriginCoords(destCoords); setOriginName(destName)
    setDestCoords(oC); setDestName(oN)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if(!originCoords || !destCoords) {
       return toast.error("Por favor selecciona origen y destino en el mapa.")
    }
    
    try {
      await api.post('/requests', formData)
      setShowForm(false)
      setFormData({ pickup_address: '', delivery_address: '', description: '', instructions: '', weight_kg: '', budget: '', vehicle_type: 'car', service_type: 'immediate', schedule_date: '' })
      setOriginCoords(null); setDestCoords(null)
      fetchRequests()
      toast.success(t('success.created'))
    } catch (error) {
      toast.error(t('errors.generic'))
    }
  }

  const VehicleIcon = ({ type, className }) => {
     if(type === 'moto' || type === 'messenger') return <Bike className={className}/>
     if(type === 'truck' || type === 'camion') return <Tractor className={className}/>
     if(type === 'van' || type === 'furgon') return <Truck className={className}/>
     return <Car className={className}/>
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-primary border-t-transparent flex items-center justify-center rounded-full animate-spin"></div></div>

  return (
    <div className="min-h-screen bg-gray-100/50 pb-12 relative">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {user?.role === 'client' ? t('dashboard.active_requests') : t('dashboard.active_requests')}
            </h2>
          </div>
          {user?.role === 'client' && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-colors ${showForm ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' : 'bg-primary text-white hover:bg-primary-dark'}`}
            >
              {showForm ? <><X className="w-4 h-4" /> {t('requests.cancel')}</> : <><Plus className="w-4 h-4" /> {t('requests.create_title')}</>}
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {showForm && user?.role === 'client' && (
            <motion.div initial={{ opacity: 0, height: 0, y: -20 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-xl shadow-primary/5 border border-gray-100 p-2 md:p-4 mb-8 overflow-hidden">
              
              <div className="flex flex-col lg:flex-row gap-6">
                 <div className="w-full lg:w-2/3 flex flex-col gap-4">
                    
                    <div className="flex flex-col gap-2 relative z-[1000]">
                       <div className="flex items-center gap-2">
                          <button onClick={()=>setMapMode('origin')} className={`h-full px-3 text-xs font-bold rounded-lg ${mapMode === 'origin' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>1. ORIGEN</button>
                          <SearchBox placeholder="Buscar Origen..." onSelectLocation={(coords, name) => { setOriginCoords(coords); setOriginName(name); setMapMode('destination'); }} />
                       </div>
                       <div className="flex items-center justify-center -my-3 relative z-10">
                          <button type="button" onClick={handleSwap} className="bg-white p-1.5 rounded-full border border-gray-200 shadow hover:bg-gray-50"><ArrowDownUp className="w-4 h-4 text-gray-400"/></button>
                       </div>
                       <div className="flex items-center gap-2">
                          <button onClick={()=>setMapMode('destination')} className={`h-full px-3 text-xs font-bold rounded-lg ${mapMode === 'destination' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>2. DESTINO</button>
                          <SearchBox placeholder="Buscar Destino..." onSelectLocation={(coords, name) => { setDestCoords(coords); setDestName(name); }} />
                       </div>
                    </div>

                    <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative">
                       <RequestMap origin={originCoords} setOrigin={setOriginCoords} destination={destCoords} setDestination={setDestCoords} selectionMode={mapMode} routeLine={routeLine} />
                    </div>

                    {routeMeta && (
                       <RouteInfo distance={routeMeta.distance} duration={routeMeta.duration} budget={Number(formData.budget)} originName={originName} destName={destName} />
                    )}
                 </div>

                 <div className="w-full lg:w-1/3 bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4"><MapPin className="w-5 h-5 text-primary"/> Detalles del Envío</h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                       
                       <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                         <button type="button" onClick={()=>setFormData({...formData, vehicle_type:'motorcycle'})} className={`flex-1 min-w-[70px] py-2 border rounded-xl flex flex-col items-center gap-1 text-xs font-bold shadow-sm transition-all ${formData.vehicle_type === 'motorcycle' ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'}`}><Bike className="w-4 h-4"/> Moto</button>
                         <button type="button" onClick={()=>setFormData({...formData, vehicle_type:'car'})} className={`flex-1 min-w-[70px] py-2 border rounded-xl flex flex-col items-center gap-1 text-xs font-bold shadow-sm transition-all ${formData.vehicle_type === 'car' ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'}`}><Car className="w-4 h-4"/> Auto</button>
                         <button type="button" onClick={()=>setFormData({...formData, vehicle_type:'truck'})} className={`flex-1 min-w-[70px] py-2 border rounded-xl flex flex-col items-center gap-1 text-xs font-bold shadow-sm transition-all ${formData.vehicle_type === 'truck' ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'}`}><Tractor className="w-4 h-4"/> Camión</button>
                       </div>

                       <div>
                         <label className="block text-xs font-bold text-gray-700 mb-1">{t('requests.service_type')}</label>
                         <select name="service_type" value={formData.service_type} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-sm">
                           <option value="immediate">{t('requests.immediate')}</option>
                           <option value="scheduled">{t('requests.scheduled')}</option>
                         </select>
                       </div>

                       {formData.service_type === 'scheduled' && (
                         <div className="animate-in fade-in slide-in-from-top-4">
                           <label className="block text-xs font-bold text-gray-700 mb-1">{t('requests.schedule_date')}</label>
                           <input type="datetime-local" name="schedule_date" value={formData.schedule_date} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm" required />
                         </div>
                       )}

                       <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">{t('requests.weight')}</label>
                            <input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 text-sm" step="0.5" placeholder="0.0" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">{t('requests.budget')} Algoritmo</label>
                            <div className="relative border-2 border-primary/20 rounded-xl bg-primary/5">
                              <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                              <input type="number" name="budget" value={formData.budget} onChange={handleChange} className="w-full pl-7 pr-2 py-3 bg-transparent font-black text-gray-900 border-none outline-none text-sm" step="0.01" required />
                            </div>
                          </div>
                       </div>

                       <div>
                         <label className="block text-xs font-bold text-gray-700 mb-1">{t('requests.description')}</label>
                         <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm" rows="1" placeholder="Ej. 10 Cajas frágiles..." />
                       </div>

                       <div>
                         <label className="block text-xs font-bold text-gray-700 mb-1">{t('requests.instructions')}</label>
                         <textarea name="instructions" value={formData.instructions} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm" rows="1" placeholder="Ej. Tocar timbre rojo en segunda puerta..." />
                       </div>

                       <div className="pt-2">
                         <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={!routeMeta} className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold shadow-md transition-all ${routeMeta ? 'bg-gradient-to-tr from-primary to-primary-dark text-white hover:shadow-lg hover:shadow-primary/20' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                           {t('requests.submit')} <ArrowRight className="w-5 h-5" />
                         </motion.button>
                       </div>

                    </form>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {requests.map((request) => (
             <div key={request.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <VehicleIcon type={request.vehicle_type || 'car'} className="text-gray-400 w-5 h-5" />
                    <span className="font-bold text-gray-900">Req #{request.id.substring(0,6)}</span>
                  </div>
                  <span className="bg-gray-100 text-gray-600 px-2.5 py-1 text-xs font-bold rounded-lg uppercase">{request.status}</span>
                </div>
                <div className="space-y-2 mt-4 text-sm font-medium">
                  <div className="flex items-start gap-2 text-gray-600 truncate"><span className="text-green-500 shrink-0">🟢</span> {request.pickup_address}</div>
                  <div className="flex items-start gap-2 text-gray-600 truncate"><span className="text-red-500 shrink-0">🔴</span> {request.delivery_address}</div>
                </div>
                <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-100">
                  <div className="font-black text-lg text-primary">${request.budget}</div>
                  <motion.button onClick={() => window.location.href = `/requests/${request.id}`} whileHover={{scale: 1.05}} whileTap={{scale: 0.95}} className="px-4 py-2 bg-gray-50 hover:bg-primary/10 text-primary font-bold text-sm rounded-xl">Revisar Ofertas</motion.button>
                </div>
             </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default RequestsPage