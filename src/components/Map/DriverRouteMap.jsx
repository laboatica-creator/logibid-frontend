import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';

const greenIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] });
const redIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] });

const driverIcon = L.divIcon({
  className: 'custom-driver-icon',
  html: '<div style="background-color: #3b82f6; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4); animation: pulse 2s infinite;"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const FitAndRoute = ({ start, pickup, delivery, setRouteInfo }) => {
  const map = useMap();
  useEffect(() => {
    if (pickup && delivery) {
      map.fitBounds([start || pickup, delivery], { padding: [50, 50] });
      // Fetch OSRM via pickup -> delivery (waypoint if start is driver)
      const coordsQuery = start ? `${start[1]},${start[0]};${pickup[1]},${pickup[0]};${delivery[1]},${delivery[0]}` : `${pickup[1]},${pickup[0]};${delivery[1]},${delivery[0]}`;
      fetch(`https://router.project-osrm.org/route/v1/driving/${coordsQuery}?overview=full&geometries=geojson`)
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
  }, [start, pickup, delivery, map, setRouteInfo]);
  return null;
};

const extractCoords = (str) => {
  if(!str) return null;
  const match = str.match(/-?\d+\.\d+/g);
  if (match && match.length >= 2) return [parseFloat(match[0]), parseFloat(match[1])];
  return null; 
};

// Mapa para transportista con el "Waze/Google Maps" link
const DriverRouteMap = ({ pickupStr, deliveryStr, driverLocation, onUpdateRoute }) => {
  const [routeInfo, setRouteInfo] = useState({ path: [], distance: 0, duration: 0 });
  const startCoords = driverLocation ? [driverLocation.lat, driverLocation.lng] : null;
  const pickup = extractCoords(pickupStr);
  const delivery = extractCoords(deliveryStr);

  useEffect(() => {
     if(onUpdateRoute && routeInfo.distance) {
        onUpdateRoute(routeInfo);
     }
  }, [routeInfo]);

  const openNavigation = () => {
    if(!delivery) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${startCoords ? startCoords[0]+','+startCoords[1] : pickup[0]+','+pickup[1]}&destination=${delivery[0]},${delivery[1]}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <div className="h-[450px] w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 relative z-0">
      <MapContainer center={pickup || [9.9281, -84.0907]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        
        {pickup && <Marker position={pickup} icon={greenIcon}><Popup>A Recoger Aquí</Popup></Marker>}
        {delivery && <Marker position={delivery} icon={redIcon}><Popup>Destino Final</Popup></Marker>}
        {startCoords && <Marker position={startCoords} icon={driverIcon}><Popup>Tú estás aquí</Popup></Marker>}
        
        {routeInfo.path.length > 0 && <Polyline positions={routeInfo.path} color="#e11d48" weight={6} opacity={0.8} />}

        {pickup && delivery && <FitAndRoute start={startCoords} pickup={pickup} delivery={delivery} setRouteInfo={setRouteInfo} />}
      </MapContainer>

      <button 
        onClick={openNavigation}
        className="absolute bottom-6 right-6 z-[1000] bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold hover:scale-105 transition-transform"
      >
        <Navigation className="w-5 h-5"/> IR A NAVEGACIÓN
      </button>
    </div>
  );
};

export default DriverRouteMap;
