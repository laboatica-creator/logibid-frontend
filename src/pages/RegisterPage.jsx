import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, User, Mail, Phone, Lock, ArrowRight, CreditCard, Building } from 'lucide-react'
import { toast } from 'sonner'
import api from '../services/api'

const RegisterPage = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', role: 'client',
    // Driver fields
    vehicle_type: 'moto', vehicle_brand: '', vehicle_model: '', vehicle_year: '', vehicle_plate: '', max_weight_kg: '',
    bank_name: '', account_type: 'ahorros', account_number: ''
  })
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step === 1 && formData.role === 'driver') {
      setStep(2); return;
    }

    try {
      // 1. Crear usuario
      const user = await register({
        name: formData.name, email: formData.email, phone: formData.phone, password: formData.password, role: formData.role
      })
      
      // 2. Si es driver, almacenar el resto (Simulando API REST)
      if (formData.role === 'driver') {
        const vehiclePayload = {
          driver_id: user.id, type: formData.vehicle_type, brand: formData.vehicle_brand, model: formData.vehicle_model, 
          year: formData.vehicle_year, plate: formData.vehicle_plate, max_weight_kg: formData.max_weight_kg
        }
        const bankPayload = {
          driver_id: user.id, bank_name: formData.bank_name, account_type: formData.account_type, account_number: formData.account_number
        }
        await Promise.all([
           api.post('/vehicles', vehiclePayload).catch(e => console.log('Vehicles API not ready yet')),
           api.post('/payout-methods', bankPayload).catch(e => console.log('Payouts API not ready yet'))
        ])
      }
      
      toast.success('Cuenta registrada correctamente')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al completar el registro')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-100 to-gray-50 py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl w-full p-8 bg-white rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Crear Cuenta</h2>
          <p className="text-gray-500 mt-2 text-sm">{step === 1 ? 'Únete a la red LogiBid' : 'Completa tu perfil de Transportista'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Tipo de Usuario</label>
                  <div className="grid grid-cols-2 gap-3 py-1">
                    <button type="button" onClick={() => setFormData({...formData, role: 'client'})} className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${formData.role === 'client' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500'}`}>
                      <User className="w-6 h-6" /> <span className="text-sm font-semibold">Cliente</span>
                    </button>
                    <button type="button" onClick={() => setFormData({...formData, role: 'driver'})} className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${formData.role === 'driver' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500'}`}>
                      <Truck className="w-6 h-6" /> <span className="text-sm font-semibold">Transportista</span>
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
                    <div>
                       <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                       <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} className="w-full p-2 text-sm border rounded-lg">
                         <option value="moto">Moto</option><option value="auto">Automóvil</option>
                         <option value="furgon">Furgón</option><option value="camion_pequeno">Camión Pequeño</option>
                       </select>
                    </div>
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Marca</label><input type="text" name="vehicle_brand" value={formData.vehicle_brand} onChange={handleChange} className="w-full p-2 border rounded-lg" required /></div>
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Modelo</label><input type="text" name="vehicle_model" value={formData.vehicle_model} onChange={handleChange} className="w-full p-2 border rounded-lg" required /></div>
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Placa</label><input type="text" name="vehicle_plate" value={formData.vehicle_plate} onChange={handleChange} className="w-full p-2 border rounded-lg uppercase" required /></div>
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Carga Máxima (KG)</label><input type="number" name="max_weight_kg" value={formData.max_weight_kg} onChange={handleChange} className="w-full p-2 border rounded-lg" required /></div>
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