import { useState, useCallback, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'

const SearchBox = ({ onSelectLocation }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const timeoutRef = useRef(null)

  const handleSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      )
      
      if (!response.ok) throw new Error('Error en la búsqueda')
      
      const data = await response.json()
      setResults(data)
      setShowResults(true)
    } catch (error) {
      console.error('Error buscando dirección:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    setShowResults(false)
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    
    timeoutRef.current = setTimeout(() => {
      if (value.length >= 3) {
        handleSearch(value)
      } else {
        setResults([])
      }
    }, 500)
  }

  const handleSelect = (result) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    onSelectLocation([lat, lng], result.display_name)
    setQuery(result.display_name)
    setShowResults(false)
    setResults([])
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Buscar dirección..."
          className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>
      
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelect(result)}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
            >
              <p className="text-gray-700">{result.display_name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBox