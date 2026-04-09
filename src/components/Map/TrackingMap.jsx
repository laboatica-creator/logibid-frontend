import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default icons in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const TrackingMap = ({ pickupStr, deliveryStr, status, driverLocation }) => {
  // Simulando coordenadas basadas en strings aleatorios o centro por defecto de Costa Rica
  const defaultCenter = [9.9281, -84.0907]
  const pickupCoords = [9.9320, -84.1000] // Ejemplo mock
  const deliveryCoords = [9.9200, -84.0800] // Ejemplo mock
  const driverCoords = driverLocation || [9.9300, -84.0950]

  return (
    <div className="h-64 sm:h-96 w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative z-0">
      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <Marker position={pickupCoords}>
          <Popup>Origen: {pickupStr}</Popup>
        </Marker>

        <Marker position={deliveryCoords}>
          <Popup>Destino: {deliveryStr}</Popup>
        </Marker>

        {status !== 'pending' && status !== 'completed' && (
          <Marker position={driverCoords}>
             <Popup>📍 Transportista en camino</Popup>
          </Marker>
        )}

        {/* Línea simulando la ruta optima */}
        <Polyline positions={[pickupCoords, deliveryCoords]} color="#1E3A8A" dashArray="5, 10" />
      </MapContainer>
    </div>
  )
}

export default TrackingMap
