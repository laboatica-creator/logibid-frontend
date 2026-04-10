import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck } from 'lucide-react';

const greenIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] });
const redIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] });

const driverIcon = L.divIcon({
  className: 'custom-driver-icon',
  html: '<div style="background-color: #3b82f6; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const FitAndRoute = ({ start, end, setRouteInfo }) => {
  const map = useMap();
  useEffect(() => {
    if (start && end) {
      map.fitBounds([start, end], { padding: [50, 50] });
      // Fetch OSRM
      fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes[0]) {
             const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
             const distance = (data.routes[0].distance / 1000).toFixed(1);
             const duration = Math.ceil(data.routes[0].duration / 60);
             setRouteInfo({ path: coords, distance, duration });
          }
        }).catch(()=>console.log("OSRM Error"));
    }
  }, [start, end, map, setRouteInfo]);
  return null;
};

const extractCoords = (str) => {
  if(!str) return null;
  const match = str.match(/-?\d+\.\d+/g);
  if (match && match.length >= 2) return [parseFloat(match[0]), parseFloat(match[1])];
  return null; // fallback to geocoding? Let's just use what we have realistically for the demo.
};

const TrackingMap = ({ pickupStr, deliveryStr, driverLocation, onUpdateRoute }) => {
  const [routeInfo, setRouteInfo] = useState({ path: [], distance: 0, duration: 0 });
  const startCoords = extractCoords(pickupStr);
  const endCoords = extractCoords(deliveryStr);

  useEffect(() => {
     if(onUpdateRoute && routeInfo.distance) {
        onUpdateRoute(routeInfo);
     }
  }, [routeInfo]);

  // Si hay transportista, calculamos la distancia entre transportista y el destino actual
  const [dynamicRoute, setDynamicRoute] = useState([]);
  
  useEffect(() => {
     if(driverLocation && endCoords) {
        fetch(`https://router.project-osrm.org/route/v1/driving/${driverLocation.lng},${driverLocation.lat};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes[0]) {
             setDynamicRoute(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
          }
        }).catch(()=>{});
     }
  }, [driverLocation, endCoords]);

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 relative z-0">
      <MapContainer center={startCoords || [9.9281, -84.0907]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        
        {startCoords && <Marker position={startCoords} icon={greenIcon}><Popup>Recogida</Popup></Marker>}
        {endCoords && <Marker position={endCoords} icon={redIcon}><Popup>Entrega</Popup></Marker>}
        
        {driverLocation && <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}><Popup>Ubicación en Tiempo Real</Popup></Marker>}
        
        {/* Draw Full Route */}
        {routeInfo.path.length > 0 && !driverLocation && <Polyline positions={routeInfo.path} color="#15803d" weight={5} opacity={0.6} dashArray="10, 10" />}
        {/* Draw Dynamic Driver Route */}
        {dynamicRoute.length > 0 && driverLocation && <Polyline positions={dynamicRoute} color="#2563eb" weight={6} opacity={0.8} />}

        {startCoords && endCoords && !driverLocation && <FitAndRoute start={startCoords} end={endCoords} setRouteInfo={setRouteInfo} />}
        {driverLocation && endCoords && <FitAndRoute start={[driverLocation.lat, driverLocation.lng]} end={endCoords} setRouteInfo={()=>{}} />}
      </MapContainer>
      
      {driverLocation && (
        <div className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg border border-blue-400 flex items-center gap-2 animate-pulse">
          <Truck className="w-5 h-5"/> EN CAMINO
        </div>
      )}
    </div>
  );
};

export default TrackingMap;
