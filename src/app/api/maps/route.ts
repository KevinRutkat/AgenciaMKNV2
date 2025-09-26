import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_MAPS_API_KEY = 'AIzaSyD12gOZPdhmYS8vMD0ziGwW_cCU7sY7X-E'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const type = searchParams.get('type') // 'search' or 'place_details'
  const placeId = searchParams.get('place_id')

  if (!query && !placeId) {
    return NextResponse.json({ error: 'Query or place_id is required' }, { status: 400 })
  }

  try {
    let url = ''
    
    if (type === 'search' && query) {
      // Usar Places Autocomplete API para sugerencias en tiempo real
      url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}&language=es&components=country:es&types=address`
    } else if (type === 'place_details' && placeId) {
      // Obtener detalles del lugar usando Place Details API
      url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry,formatted_address`
    } else {
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
    }

    console.log('Calling Google Maps API:', url.replace(GOOGLE_MAPS_API_KEY, 'API_KEY_HIDDEN'))
    
    const response = await fetch(url)
    const data = await response.json()

    console.log('Google Maps API response:', data)

    if (data.status === 'REQUEST_DENIED') {
      console.error('Google Maps API request denied:', data.error_message)
      return NextResponse.json({ error: 'Google Maps API access denied. Please check API key and enabled services.' }, { status: 403 })
    }

    if (type === 'search') {
      // Procesar resultados de búsqueda de Places Autocomplete
      const suggestions = data.predictions?.map((prediction: {place_id: string, description: string}) => ({
        place_id: prediction.place_id,
        description: prediction.description
      })).slice(0, 5) || []
      
      return NextResponse.json({ suggestions })
    } else {
      // Devolver detalles del lugar
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error('Error calling Google Maps API:', error)
    return NextResponse.json({ error: 'Failed to fetch data from Google Maps' }, { status: 500 })
  }
}
