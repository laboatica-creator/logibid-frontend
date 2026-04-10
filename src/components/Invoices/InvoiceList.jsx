import { useState } from 'react'
import { FileText, Download } from 'lucide-react'
import { motion } from 'framer-motion'

const InvoiceList = ({ invoices = [] }) => {
   
   return (
     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg mb-6"><FileText className="w-5 h-5 text-gray-500"/> Mis Facturas</h3>

        <div className="space-y-3">
          {invoices.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No tienes facturas emitidas aún.</p>
          ) : (
            invoices.map(inv => (
              <div key={inv.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                   <div className="bg-red-50 p-2 rounded-lg"><FileText className="w-5 h-5 text-red-500"/></div>
                   <div>
                     <h4 className="font-bold text-sm text-gray-900">{inv.invoice_number}</h4>
                     <p className="text-xs text-gray-500">{new Date(inv.created_at).toLocaleDateString()} • {inv.type === 'client' ? 'Factura por Viaje' : 'Liquidación Semanal'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-900">${inv.total}</span>
                  <a href={inv.pdf_url} target="_blank" rel="noreferrer" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
     </div>
   )
}

export default InvoiceList
