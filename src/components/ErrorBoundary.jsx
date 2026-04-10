import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Algo salió mal</h2>
          <p className="text-gray-600 mb-4">{this.state.error?.message || 'Error desconocido'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-white px-4 py-2 rounded-lg"
          >
            Recargar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary