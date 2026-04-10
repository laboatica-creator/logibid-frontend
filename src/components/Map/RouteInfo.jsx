import { useLanguage } from '../../context/LanguageContext'
import { MapPin, Route as RouteIcon, Clock, DollarSign } from 'lucide-react'

const RouteInfo = ({ distance, duration, budget, originName, destName }) => {
  const { t } = useLanguage()

  if (!distance || !duration) return null;

  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-2xl p-4 w-full mt-4">
      <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3 flex items-center gap-2">
         <RouteIcon className="w-4 h-4 text-primary" /> Resumen de Ruta
      </h4>
      
      <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 mb-4 text-xs font-medium">
         <div className="bg-gray-50 p-2 rounded-lg text-center truncate" title={originName}><MapPin className="w-3 h-3 inline text-green-500 mr-1"/>{originName || 'Origen Geográfico'}</div>
         <div className="text-gray-300">→</div>
         <div className="bg-gray-50 p-2 rounded-lg text-center truncate" title={destName}><MapPin className="w-3 h-3 inline text-red-500 mr-1"/>{destName || 'Destino Geográfico'}</div>
      </div>

      <div className="flex justify-between gap-2">
         <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
            <RouteIcon className="w-4 h-4 mx-auto text-blue-500 mb-1" />
            <div className="text-xs text-blue-800 font-semibold">{t('requests.distance')}</div>
            <div className="font-black text-blue-900">{distance.toFixed(1)} km</div>
         </div>
         <div className="flex-1 bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
            <Clock className="w-4 h-4 mx-auto text-orange-500 mb-1" />
            <div className="text-xs text-orange-800 font-semibold">{t('requests.duration')}</div>
            <div className="font-black text-orange-900">{Math.ceil(duration)} min</div>
         </div>
         <div className="flex-1 bg-green-50 border border-green-100 rounded-xl p-3 text-center">
            <DollarSign className="w-4 h-4 mx-auto text-green-500 mb-1" />
            <div className="text-xs text-green-800 font-semibold">{t('requests.suggested_price')}</div>
            <div className="font-black text-green-900">${budget?.toFixed(2) || '0.00'}</div>
         </div>
      </div>
    </div>
  )
}

export default RouteInfo
