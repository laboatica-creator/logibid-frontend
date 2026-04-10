import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Printer, PieChart as PieChartIcon } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import api from '../services/api'
import Header from '../components/Layout/Header'

const COLORS = ['#1E3A8A', '#F97316', '#10B981', '#EF4444'];

const ReportsPage = () => {
  const [data, setData] = useState({ requests: [], payments: [], users: [] })
  
  useEffect(() => {
    // Extraemos todo de la API (en un caso real serían llamadas /admin/reports específicas)
    Promise.all([
      api.get('/requests').catch(()=>({data:[]})),
      api.get('/payments').catch(()=>({data:[]})),
      api.get('/users').catch(()=>({data:[]}))
    ]).then(([reqRes, payRes, userRes]) => {
      setData({ requests: reqRes.data, payments: payRes.data, users: userRes.data })
    })
  }, [])

  // Simulación de estadísticas procesadas
  const incomeData = [
    { name: 'Ene', ingresos: 4000, comisiones: 600 },
    { name: 'Feb', ingresos: 8000, comisiones: 1200 },
    { name: 'Mar', ingresos: 12000, comisiones: 1800 },
  ]
  const statusDist = [
    { name: 'Completadas', value: data.requests.filter(r=>r.status==='completed').length || 10 },
    { name: 'Pendientes', value: data.requests.filter(r=>r.status==='pending').length || 5 },
    { name: 'Asignadas', value: data.requests.filter(r=>r.status==='assigned').length || 3 },
  ]

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.text("Reporte General - LogiBid", 14, 15)
    doc.autoTable({
      head: [['ID', 'Origen', 'Destino', 'Estado']],
      body: data.requests.slice(0, 10).map(r => [r.id || 'N/A', r.pickup_address, r.delivery_address, r.status]),
      startY: 25
    })
    doc.save('logibid_reporte.pdf')
  }

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data.requests)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Solicitudes")
    XLSX.writeFile(wb, 'logibid_reporte.xlsx')
  }

  return (
    <div className="min-h-screen bg-gray-100/50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><PieChartIcon className="text-primary"/> Centro de Reportes Finacieros</h1>
          <div className="flex gap-2">
            <button onClick={exportPDF} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold"><Download className="w-4 h-4"/> PDF</button>
            <button onClick={exportExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold"><FileText className="w-4 h-4"/> Excel</button>
            <button onClick={()=>window.print()} className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold"><Printer className="w-4 h-4"/> Imprimir</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4 text-gray-800">Proyección de Ingresos (Comisiones vs Facturación)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incomeData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="ingresos" stroke="#1E3A8A" strokeWidth={3} />
                  <Line type="monotone" dataKey="comisiones" stroke="#F97316" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4 text-gray-800">Distribución de Estados</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusDist} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {statusDist.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ReportsPage
