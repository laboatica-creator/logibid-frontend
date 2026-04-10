import { useState } from 'react'
import { CreditCard, Plus, Trash2, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'

const PaymentMethodsSection = () => {
   const { t } = useLanguage()
   const [cards, setCards] = useState([
     { id: 1, last4: '4242', brand: 'Visa', default: true },
     { id: 2, last4: '5555', brand: 'Mastercard', default: false }
   ]);
   const [showAdd, setShowAdd] = useState(false)

   const handleAdd = (e) => {
     e.preventDefault()
     setCards([...cards, { id: Date.now(), last4: '1234', brand: 'Visa', default: cards.length === 0 }])
     setShowAdd(false)
   }

   const setDefault = (id) => {
     setCards(cards.map(c => ({ ...c, default: c.id === id })))
   }

   const removeCard = (id) => {
     setCards(cards.filter(c => c.id !== id))
   }

   return (
     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
           <div>
             <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg"><CreditCard className="w-5 h-5 text-primary"/> Mis Métodos de Pago</h3>
             <p className="text-sm text-gray-500">Gestiona tus tarjetas para solicitar viajes</p>
           </div>
           {!showAdd && (
             <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/20">
               <Plus className="w-4 h-4"/> Añadir Tarjeta
             </button>
           )}
        </div>

        {showAdd && (
          <motion.form initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} onSubmit={handleAdd} className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
             <h4 className="font-bold text-sm mb-3">Conexión Segura (Stripe Sandbox)</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Número de Tarjeta" className="px-4 py-2 border rounded-lg text-sm" required />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="MM/YY" className="px-4 py-2 border rounded-lg text-sm" required />
                  <input type="text" placeholder="CVC" className="px-4 py-2 border rounded-lg text-sm" required />
                </div>
             </div>
             <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={()=>setShowAdd(false)} className="px-4 py-2 text-gray-500 font-medium text-sm">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white font-bold rounded-lg text-sm">Guardar Tarjeta</button>
             </div>
          </motion.form>
        )}

        <div className="space-y-3">
          {cards.map(card => (
            <div key={card.id} className={`flex items-center justify-between p-4 rounded-xl border ${card.default ? 'border-primary bg-primary/5' : 'border-gray-100'} transition-all`}>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-600">{card.brand}</div>
                  <div>
                    <h4 className="font-bold text-sm">•••• •••• •••• {card.last4}</h4>
                    {card.default && <span className="text-xs text-primary font-bold">Predeterminada</span>}
                  </div>
               </div>
               <div className="flex items-center gap-2">
                 {!card.default && <button onClick={()=>setDefault(card.id)} className="text-xs font-bold text-gray-500 hover:text-primary">Hacer Default</button>}
                 <button onClick={()=>removeCard(card.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
               </div>
            </div>
          ))}
          {cards.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No tienes tarjetas guardadas.</p>}
        </div>
     </div>
   )
}

export default PaymentMethodsSection
