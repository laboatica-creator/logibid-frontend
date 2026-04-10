import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Truck, MapPin, Package, DollarSign, ArrowLeft, CheckCircle, Clock, ShieldCheck, CreditCard } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'sonner'
import api from '../services/api'
import Header from '../components/Layout/Header'
import TrackingMap from '../components/Map/TrackingMap'
import DriverRouteMap from '../components/Map/DriverRouteMap'
import RouteInfo from '../components/Map/RouteInfo'
import Chat from '../components/Chat/Chat'
import { loadStripe } from '@stripe/stripe-js'
import { io } from 'socket.io-client'
import { playNewBidSound, playBidAcceptedSound, initSoundContext } from '../services/soundService'
import DriverLocationService from '../services/DriverLocationService'

const stripePromise = loadStripe('pk_test_placeholder')

const RequestDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [request, setRequest] = useState(null)
  const [bids, setBids] = useState([])
  const [config, setConfig] = useState({ seguroPorcentaje: 5, seguroCoberturaMaxima: 500000 })
  const [loading, setLoading] = useState(true)
  
  const [bidAmount, setBidAmount] = useState('')
  const [bidMessage, setBidMessage] = useState('')
  
  const [driverLocation, setDriverLocation] = useState(null)
  const [routeStats, setRouteStats] = useState(null)

  useEffect(() => {
    initSoundContext()
    fetchData()

    const socket = io('https://logibid-api.onrender.com')
    socket.on('connect', () => console.log('Socket Tracking Activo'))
    
    socket.on('new_bid', (data) => {
      if (data.request_id === id) {
        if(user?.role === 'client') playNewBidSound()
        fetchData()
      }
    })

    socket.on('bid_accepted', (data) => {
      if (data.request_id === id) {
        if(user?.role === 'driver') playBidAcceptedSound()
        fetchData()
      }
    })

    socket.on('driver-location-update', (data) => {
       if(data.request_id === id) {
         setDriverLocation({ lat: data.lat, lng: data.lng })
       }
    })

    return () => socket.disconnect()
  }, [id])

  const fetchData = async () => {
    try {
      const [reqRes, bidsRes, cfgRes] = await Promise.all([
        api.get(`/requests/${id}`),
        api.get(`/bids/request/${id}`).catch(() => ({ data: [] })),
        api.get('/system-config').catch(() => ({ data: [] }))
      ])
      const r = reqRes.data
      setRequest(r)
      setBids(bidsRes.data || [])

      if (cfgRes.data.length > 0) {
        const perc = cfgRes.data.find(c => c.key === 'seguro_porcentaje')?.value || 5
        const max = cfgRes.data.find(c => c.key === 'seguro_cobertura_maxima')?.value || 500000
        setConfig({ seguroPorcentaje: Number(perc), seguroCoberturaMaxima: Number(max) })
      }
    } catch (error) {
      toast.error('Error al cargar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  const isAssigned = request?.status === 'assigned' || request?.status === 'completed'
  const acceptedBid = bids.find(b => b.status === 'accepted')
  const myAcceptedBid = user?.role === 'driver' && acceptedBid?.driver_id === user.id

  useEffect(() => {
    // Si soy el Transportista en Viaje -> Track location via Geolocation y emit it
    if (user?.role === 'driver' && isAssigned && myAcceptedBid) {
       DriverLocationService.startTracking(user.id, id);
    }
    return () => DriverLocationService.stopTracking()
  }, [user, isAssigned, myAcceptedBid])

  const handleMakeBid = async (e) => {
    e.preventDefault()
    try {
      await api.post('/bids', { request_id: id, amount: Number(bidAmount), message: bidMessage })
      toast.success('Oferta enviada exitosamente')
      setBidAmount('')
      setBidMessage('')
      fetchData()
    } catch (err) {
      toast.error('Error al enviar la oferta')
    }
  }

  const handleAcceptBid = async (bidId, amount) => {
    if(!window.confirm('¿Aceptar esta oferta e ir al pago?')) return
    const seguroCalculado = amount * (config.seguroPorcentaje / 100)
    const neto = amount + seguroCalculado

    try {
      await api.patch(`/bids/${bidId}/accept`, { seguro: { porcentaje: config.seguroPorcentaje, monto: seguroCalculado } })
      toast.success(`Oferta aceptada. Monto total con seguro: $${neto.toFixed(2)}`)
      fetchData()
    } catch (err) {
      toast.error('Error al aceptar la oferta')
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="w-16 h-16 border-4 border-primary border-t-transparent flex items-center justify-center rounded-full animate-spin"></div></div>
  if (!request) return <div className="text-center mt-20">Solicitud no encontrada</div>

  const timelineFlow = ["pending", "assigned", "picking_up", "picked_up", "delivering", "arrived", "completed"]
  const cxStatus = (request.status || "pending")
  const statusIndex = timelineFlow.indexOf(cxStatus) >= 0 ? timelineFlow.indexOf(cxStatus) : 0

  return (
    <div className="min-h-screen bg-gray-100/50 pb-12">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <button onClick={() => navigate('/requests')} className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Volver a solicitudes
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Truck className="w-7 h-7 text-primary" /> Carga #{id.substring(0,6)}
              </h1>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${isAssigned ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {statusIndex > 1 ? 'EN TRÁNSITO' : isAssigned ? 'ASIGNADA' : 'BUSCANDO TRANSPORTISTA'}
              </span>
            </div>

            {user?.role === 'driver' ? (
               <DriverRouteMap pickupStr={request.pickup_address} deliveryStr={request.delivery_address} driverLocation={driverLocation} onUpdateRoute={setRouteStats} />
            ) : (
               <TrackingMap pickupStr={request.pickup_address} deliveryStr={request.delivery_address} driverLocation={driverLocation} onUpdateRoute={setRouteStats} />
            )}

            {routeStats && (
               <RouteInfo distance={Number(routeStats.distance)} duration={Number(routeStats.duration)} budget={Number(request.budget)} originName={request.pickup_address} destName={request.delivery_address} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 bg-gray-50 p-4 rounded-xl">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Recogida</p>
                <p className="text-gray-900 font-bold flex items-start gap-2"><MapPin className="w-5 h-5 text-gray-400 shrink-0"/> {request.pickup_address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Entrega</p>
                <p className="text-gray-900 font-bold flex items-start gap-2"><MapPin className="w-5 h-5 text-secondary shrink-0"/> {request.delivery_address}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-sm text-blue-900">{request.weight_kg} kg</span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-bold text-sm text-green-900">Base ${request.budget}</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                <span className="font-bold text-sm text-orange-900">Asegurado ({config.seguroPorcentaje}%)</span>
              </div>
            </div>
          </motion.div>

          {/* Timeline de Seguimiento */}
          {isAssigned && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold mb-4">Seguimiento en Tiempo Real</h3>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${(statusIndex / (timelineFlow.length - 1)) * 100}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-semibold uppercase">
                  <span>Asignada</span>
                  <span>En Origen</span>
                  <span>En Ruta</span>
                  <span>Entregado</span>
                </div>
             </motion.div>
          )}

          {/* Sección de Chat */}
          {isAssigned && (user?.role === 'client' || myAcceptedBid) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Chat requestId={id} user={user} driverId={acceptedBid?.driver_id} clientId={request.client_id} />
            </motion.div>
          )}

        </div>

        <div className="lg:w-96 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Ofertas Recibidas</h2>
          
          {user?.role === 'driver' && !isAssigned && (
            <motion.form onSubmit={handleMakeBid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
              <h3 className="font-bold text-primary mb-3">Hacer Oferta</h3>
              <div className="space-y-3">
                <input type="number" placeholder="Monto Neto ($)" value={bidAmount} onChange={e => setBidAmount(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200" required />
                <input type="text" placeholder="Tiempo estimado..." value={bidMessage} onChange={e => setBidMessage(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200" />
                <button type="submit" className="w-full bg-secondary hover:bg-secondary-dark text-white font-bold px-4 py-3 rounded-xl transition-colors">
                  Enviar Oferta
                </button>
              </div>
            </motion.form>
          )}

          {bids.length === 0 ? (
             <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
               <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
               <p className="text-gray-500 text-sm">No hay ofertas</p>
             </div>
          ) : (
            <div className="space-y-3">
              {bids.map(bid => {
                const insuranceFee = Number(bid.amount) * (config.seguroPorcentaje / 100);
                const totalClient = Number(bid.amount) + insuranceFee;

                return (
                  <div key={bid.id} className={`bg-white rounded-xl p-4 border ${bid.status === 'accepted' ? 'border-success ring-1 ring-success/30' : 'border-gray-100'} shadow-sm`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs text-gray-500">Chofer #{bid.driver_id.substring(0,4)}</p>
                        <p className="font-bold text-gray-900 text-lg">${bid.amount}</p>
                      </div>
                      {bid.status === 'accepted' && (
                        <div className="text-success font-bold bg-success/10 px-2 py-1 rounded text-xs flex items-center gap-1">
                          <CheckCircle className="w-3 h-3"/> Ganadora
                        </div>
                      )}
                    </div>
                    {bid.message && <p className="text-xs text-gray-600 italic">"{bid.message}"</p>}
                    
                    {user?.role === 'client' && !isAssigned && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Seguro de Carga ({config.seguroPorcentaje}%)</span><span className="font-semibold text-orange-600">+ ${insuranceFee.toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm font-bold mb-3"><span className="text-gray-800">Total a Pagar</span><span className="text-primary">${totalClient.toFixed(2)}</span></div>
                        
                        <button onClick={() => handleAcceptBid(bid.id, Number(bid.amount))} className="w-full bg-primary hover:bg-primary-dark text-white font-semibold flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl transition-colors">
                          <CreditCard className="w-4 h-4"/> Pagar y Aceptar
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
export default RequestDetailPage
