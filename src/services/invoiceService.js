import api from './api'

export const invoiceService = {
  getInvoices: async () => {
    try {
      const response = await api.get('/invoices')
      return response.data
    } catch (e) {
      console.error(e)
      return []
    }
  },
  generateInvoice: async (payload) => {
    try {
      const response = await api.post('/invoices/generate', payload)
      return response.data
    } catch (e) {
      throw e
    }
  }
}
