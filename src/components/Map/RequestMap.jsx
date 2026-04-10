import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const greenIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
const redIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

// SVG Icon for current location (Pulsing blue dot)
const myLocationIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div style="background-color: #3b82f6; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4); animation: pulse 2s infinite;"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
})

const LocationMarker = ({ setCoords, selectionMode }) => {
  useMapEvents({
    click(e) { if(selectionMode) setCoords([e.latlng.lat, e.latlng.lng]) },
  })
  return null
}

const AutoCenterMap = ({ coords }) => {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, 14, { animate: true })
  }, [coords, map])
  return null
}

const FitBoundsMap = ({ routeCoords }) => {
  const map = useMap()
  useEffect(() => {
    if (routeCoords && routeCoords.length > 0) {
      const bounds = L.latLngBounds(routeCoords)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [routeCoords, map])
  return null
}

const RequestMap = ({ origin, setOrigin, destination, setDestination, selectionMode, routeLine }) => {
  const [currentLoc, setCurrentLoc] = useState(null)
  const defaultCenter = [9.9281, -84.0907] 

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentLoc([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.log("Geoloc error:", err),
        { enableHighAccuracy: true }
      )
    }
  }, [])

  // Auto center on current loc initially if origin not set
  const initialCenter = origin || currentLoc || defaultCenter

  const handleMapClick = (coords) => {
    if (selectionMode === 'origin') setOrigin(coords)
    else if (selectionMode === 'destination') setDestination(coords)
  }

  return (
    <div className="h-full w-full relative">
      <style>{`@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }`}</style>
      
      <MapContainer center={initialCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        
        <LocationMarker setCoords={handleMapClick} selectionMode={selectionMode} />
        {(!routeLine || routeLine.length === 0) && <AutoCenterMap coords={origin} />}
        {routeLine && routeLine.length > 0 && <FitBoundsMap routeCoords={routeLine} />}

        {currentLoc && <Marker position={currentLoc} icon={myLocationIcon}><Popup>Tu Ubicación Exacta</Popup></Marker>}
        
        {origin && (
          <Marker position={origin} icon={greenIcon} draggable={true} eventHandlers={{ dragend: (e)=>setOrigin([e.target.getLatLng().lat, e.target.getLatLng().lng])}}>
             <Popup>Punto de Recogida</Popup>
          </Marker>
        )}
        {destination && (
          <Marker position={destination} icon={redIcon} draggable={true} eventHandlers={{ dragend: (e)=>setDestination([e.target.getLatLng().lat, e.target.getLatLng().lng])}}>
             <Popup>Punto de Entrega</Popup>
          </Marker>
        )}

        {routeLine && routeLine.length > 0 && (
           <Polyline positions={routeLine} color="#1E3A8A" weight={5} opacity={0.8} lineJoin="round" />
        )}
      </MapContainer>

      <button 
        type="button"
        onClick={() => currentLoc && setOrigin?.(currentLoc)}
        className="absolute bottom-6 right-4 z-[2000] bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center group pointer-events-auto"
        title="Usar mi ubicación actual"
      >
        <div className="w-5 h-5 rounded-full border-[3px] border-primary group-hover:bg-primary/20 transition-colors flex items-center justify-center">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
        </div>
      </button>
    </div>
  )
}

export default RequestMap