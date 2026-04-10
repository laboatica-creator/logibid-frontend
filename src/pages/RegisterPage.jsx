import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../context/LanguageContext'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, User, Mail, Phone, Lock, ArrowRight, Building, Bike } from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'
import LanguageSwitcher from '../components/Layout/LanguageSwitcher'

const RegisterPage = () => {
  const [step, setStep] = useState(1)
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', role: 'client',
    vehicle_type: 'moto', vehicle_brand: '', vehicle_model: '', vehicle_year: '', vehicle_plate: '', max_weight_kg: '',
    has_trunk: false, has_phone_mount: false,
    bank_name: '', account_type: 'ahorros', account_number: ''
  })
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step === 1 && (formData.role === 'driver' || formData.role === 'messenger')) {
      if(formData.role === 'messenger') {
         setFormData(prev => ({...prev, max_weight_kg: 15, vehicle_type: '150cc'}));
      }
      setStep(2); return;
    }

    try {
      const user = await register({
        name: formData.name, email: formData.email, phone: formData.phone, password: formData.password, role: formData.role
      })
      
      if (formData.role === 'driver' || formData.role === 'messenger') {
        const vehiclePayload = {
          driver_id: user.id, type: formData.vehicle_type, brand: formData.vehicle_brand, model: formData.vehicle_model, 
          year: formData.vehicle_year, plate: formData.vehicle_plate, max_weight_kg: formData.max_weight_kg,
          has_trunk: formData.has_trunk, has_phone_mount: formData.has_phone_mount
        }
        const bankPayload = {
          driver_id: user.id, bank_name: formData.bank_name, account_type: formData.account_type, account_number: formData.account_number
        }
        await Promise.all([
           api.post('/vehicles', vehiclePayload).catch(() => {}),
           api.post('/payout-methods', bankPayload).catch(() => {})
        ])
      }
      
      toast.success(t('success.created'))
      navigate('/dashboard')
    } catch (err) {
      toast.error(t('errors.generic'))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-100 to-gray-50 py-12 px-4 relative">
      <div className="absolute top-4 right-4 z-50">
         <LanguageSwitcher />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl w-full p-8 bg-white rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{t('register.title')}</h2>
          <p className="text-gray-500 mt-2 text-sm">{step === 1 ? t('app_name') : 'Completa tu perfil Profesional'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Selecciona tu Rol</label>
                  <div className="grid grid-cols-3 gap-2 py-1">
                    <button type="button" onClick={() => setFormData({...formData, role: 'client'})} className={`p-2 border rounded-xl flex flex-col items-center gap-1 transition-all ${formData.role === 'client' ? 'border-primary bg-primary/5 text-primary scale-105 shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                      <User className="w-5 h-5" /> <span className="text-xs font-bold">Cliente</span>
                    </button>
                    <button type="button" onClick={() => setFormData({...formData, role: 'driver'})} className={`p-2 border rounded-xl flex flex-col items-center gap-1 transition-all ${formData.role === 'driver' ? 'border-primary bg-primary/5 text-primary scale-105 shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                      <Truck className="w-5 h-5" /> <span className="text-xs font-bold">Transportista (Autos/Carga)</span>
                    </button>
                    <button type="button" onClick={() => setFormData({...formData, role: 'messenger'})} className={`p-2 border rounded-xl flex flex-col items-center gap-1 transition-all ${formData.role === 'messenger' ? 'border-primary bg-primary/5 text-primary scale-105 shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                      <Bike className="w-5 h-5" /> <span className="text-xs font-bold">Mensajero (Moto)</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <div className="relative"><User className="absolute left-3 top-3 w-5 h-5 text-gray-400" /><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl" required /></div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <div className="relative"><Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" /><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl" required /></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="relative"><Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" /><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl" required /></div>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <div className="relative"><Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" /><input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl" required /></div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
                
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                  <h4 className="font-bold flex items-center gap-2"><Truck className="w-5 h-5 text-primary"/> Información del Vehículo</h4>
                  <div className="grid grid-cols-2 gap-4">
                    
                    {formData.role === 'messenger' ? (
                       <div className="col-span-2 grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs font-medium text-gray-700 mb-1">Cilindrada (cc)</label>
                             <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} className="w-full p-2 text-sm border rounded-lg">
                               <option value="110cc">110cc</option><option value="150cc">150cc</option>
                               <option value="200cc">200cc</option><option value="250cc">250cc</option>
                             </select>
                          </div>
                          <div><label className="block text-xs font-medium text-gray-700 mb-1">Carga Máxima (KG)</label><input type="number" name="max_weight_kg" value={formData.max_weight_kg} onChange={handleChange} className="w-full p-2 border rounded-lg" disabled /></div>
                          <div className="flex items-center gap-2 mt-2"><input type="checkbox" name="has_trunk" checked={formData.has_trunk} onChange={handleChange} className="w-4 h-4 text-primary"/><label className="text-sm text-gray-700 font-medium">¿Posee Baúl Cajón?</label></div>
                          <div className="flex items-center gap-2 mt-2"><input type="checkbox" name="has_phone_mount" checked={formData.has_phone_mount} onChange={handleChange} className="w-4 h-4 text-primary"/><label className="text-sm text-gray-700 font-medium">Soporte Celular GPS</label></div>
                       </div>
                    ) : (
                       <>
                        <div>
                         <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                         <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} className="w-full p-2 text-sm border rounded-lg">
                           <option value="auto">Automóvil</option><option value="furgon">Furgón</option>
                           <option value="camion_pequeno">Camión Ligero</option><option value="camion">Camión Pesado</option>
                         </select>
                        </div>
                        <div><label className="block text-xs font-medium text-gray-700 mb-1">Carga Máxima (KG)</label><input type="number" name="max_weight_kg" value={formData.max_weight_kg} onChange={handleChange} className="w-full p-2 border rounded-lg" required /></div>
                       </>
                    )}

                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Marca</label><input type="text" name="vehicle_brand" value={formData.vehicle_brand} onChange={handleChange} className="w-full p-2 border rounded-lg" required /></div>
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Modelo</label><input type="text" name="vehicle_model" value={formData.vehicle_model} onChange={handleChange} className="w-full p-2 border rounded-lg" required /></div>
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Placa</label><input type="text" name="vehicle_plate" value={formData.vehicle_plate} onChange={handleChange} className="w-full p-2 border rounded-lg uppercase" required /></div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                  <h4 className="font-bold flex items-center gap-2"><Building className="w-5 h-5 text-green-600"/> Cuenta de Pago (Depósitos)</h4>
                  <div className="space-y-3">
                     <div><label className="block text-xs font-medium text-gray-700 mb-1">Banco</label><input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} className="w-full p-2 border rounded-lg" required /></div>
                     <div className="grid grid-cols-2 gap-4">
                       <div><label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label><select name="account_type" value={formData.account_type} onChange={handleChange} className="w-full p-2 border rounded-lg text-sm"><option value="ahorros">Ahorros</option><option value="corriente">Corriente</option></select></div>
                       <div><label className="block text-xs font-medium text-gray-700 mb-1">Número IBAN</label><input type="text" name="account_number" value={formData.account_number} onChange={handleChange} className="w-full p-2 border rounded-lg" required /></div>
                     </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 pt-2">
            {step === 2 && (
              <button type="button" onClick={() => setStep(1)} className="w-1/3 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold">Volver</button>
            )}
            <button type="submit" className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark transition-all`}>
              {step === 1 && formData.role === 'driver' ? 'Siguiente Paso' : 'Completar Registro'}
              {step === 1 && formData.role === 'driver' && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
        
        {step === 1 && (
          <div className="mt-6 text-center bg-gray-50 -mx-8 -mb-8 p-6 rounded-b-2xl border-t border-gray-100">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">Inicia Sesión</Link>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default RegisterPage