import { useState } from 'react'
import { Building, Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../services/api'
import { toast } from 'sonner'

const PayoutMethodsSection = () => {
   const [accounts, setAccounts] = useState([
     { id: 1, bank_name: 'Banco Nacional', account_number: 'CR1234567890', account_type: 'ahorros' }
   ]);
   const [showAdd, setShowAdd] = useState(false)
   const [formData, setFormData] = useState({ bank_name: '', account_number: '', account_type: 'ahorros', cedula: '' })

   const handleAdd = async (e) => {
     e.preventDefault()
     setAccounts([...accounts, { id: Date.now(), ...formData }])
     setShowAdd(false)
     toast.success('Cuenta registrada correctamente')
   }

   return (
     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
           <div>
             <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg"><Building className="w-5 h-5 text-secondary"/> Mis Cuentas de Cobro</h3>
             <p className="text-sm text-gray-500">Registra tus cuentas bancarias para recibir tus transferencias semanales</p>
           </div>
           {!showAdd && (
             <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 bg-secondary/10 text-secondary px-4 py-2 rounded-lg font-bold text-sm hover:bg-secondary/20">
               <Plus className="w-4 h-4"/> Añadir Cuenta
             </button>
           )}
        </div>

        {showAdd && (
          <motion.form initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} onSubmit={handleAdd} className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Nombre del Banco" name="bank_name" value={formData.bank_name} onChange={e=>setFormData({...formData, bank_name: e.target.value})} className="px-4 py-2 border rounded-lg text-sm" required />
                <select name="account_type" value={formData.account_type} onChange={e=>setFormData({...formData, account_type: e.target.value})} className="px-4 py-2 border rounded-lg text-sm">
                   <option value="ahorros">Cuenta de Ahorros</option>
                   <option value="corriente">Cuenta Corriente</option>
                </select>
                <input type="text" placeholder="Número de Cuenta IBAN" name="account_number" value={formData.account_number} onChange={e=>setFormData({...formData, account_number: e.target.value})} className="px-4 py-2 border rounded-lg text-sm" required />
                <input type="text" placeholder="Cédula de Identidad" name="cedula" value={formData.cedula} onChange={e=>setFormData({...formData, cedula: e.target.value})} className="px-4 py-2 border rounded-lg text-sm" required />
             </div>
             <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={()=>setShowAdd(false)} className="px-4 py-2 text-gray-500 font-medium text-sm">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-secondary text-white font-bold rounded-lg text-sm">Guardar Cuenta</button>
             </div>
          </motion.form>
        )}

        <div className="space-y-3">
          {accounts.map(acc => (
            <div key={acc.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-primary"><Building className="w-5 h-5"/></div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{acc.bank_name}</h4>
                    <span className="text-xs text-gray-500 font-mono">{acc.account_number} ({acc.account_type})</span>
                  </div>
               </div>
               <button onClick={()=>setAccounts(accounts.filter(a=>a.id!==acc.id))} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
          {accounts.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No tienes cuentas bancarias guardadas.</p>}
        </div>
     </div>
   )
}

export default PayoutMethodsSection
