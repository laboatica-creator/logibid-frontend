import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, User as UserIcon } from 'lucide-react'
import { io } from 'socket.io-client'

const Chat = ({ requestId, user, driverId, clientId }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const socketRef = useRef(null)
  
  // Si estamos en desarrollo, el host suele ser diferente, pero confiamos en que envíe a onrender.
  useEffect(() => {
    socketRef.current = io('https://logibid-api.onrender.com')
    
    // Unirse al canal de este request
    socketRef.current.emit('joinRoom', `request_${requestId}`)

    socketRef.current.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      socketRef.current.disconnect()
    }
  }, [requestId])

  const sendMessage = (e) => {
    e.preventDefault()
    if(!input.trim()) return

    const msg = {
      requestId,
      senderId: user.id,
      text: input,
      timestamp: new Date().toISOString()
    }

    socketRef.current.emit('sendMessage', msg)
    setMessages(prev => [...prev, msg])
    setInput('')
  }

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm h-96">
      <div className="bg-gray-50 border-b border-gray-200 p-4 font-bold text-gray-800 flex justify-between items-center">
        <span>Chat del Viaje</span>
        <span className="flex items-center gap-2 text-xs font-normal bg-green-100 text-green-700 px-2 py-1 rounded-full animate-pulse">En línea</span>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-10">Inicia la conversación para coordinar tu viaje.</div>
        ) : (
          messages.map((m, i) => {
            const isMe = m.senderId === user.id
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl p-3 text-sm ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                  {m.text}
                </div>
              </div>
            )
          })
        )}
      </div>

      <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <button type="submit" className="p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}

export default Chat
