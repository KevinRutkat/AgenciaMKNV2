'use client'

import { useEffect, useState } from 'react'
import { supabase, Vivienda, ViviendaImage } from '@/lib/supabase'
import ViviendaCard from '@/components/ViviendaCard'
import Banner from '@/components/Banner'
import { useMultipleTranslations } from '@/hooks/useTranslation'

export default function PropiedadesPage() {
  const [viviendas, setViviendas] = useState<Vivienda[]>([])
  const [images, setImages] = useState<ViviendaImage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('todas')
  const [sortBy, setSortBy] = useState<string>('none')

  // Traducciones de la página
  const textsToTranslate = [
    // Banner
    "Nuestras Propiedades Exclusivas",
    "Explora nuestra completa selección de propiedades frente al mar en Cabo de Palos, La Manga y alrededores del Mar Menor. Encuentra tu hogar ideal junto al mediterráneo",
    
    // Estados de carga
    "Cargando propiedades...",
    
    // Filtros y categorías
    "🏠 Todas",
    "⭐ Destacadas", 
    "Alquileres",
    "Viviendas Usadas",
    "Sin Estrenar",
    "Otros",
    "Ordenar por:",
    "Sin ordenar",
    "Precio: Menor a Mayor",
    "Precio: Mayor a Menor",
    "Tamaño: Menor a Mayor",
    "Tamaño: Mayor a Menor",
    
    // Mensajes de estado
    "Se encontraron",
    "propiedades",
    "No se encontraron propiedades",
    "No hay propiedades disponibles en esta categoría",
    "No hay propiedades disponibles en este momento"
  ]

  const [
    bannerTitle,
    bannerSubtitle,
    loadingText,
    todasLabel,
    destacadasLabel,
    alquileresLabel,
    usadasLabel,
    nuevasLabel,
    otrosLabel,
    ordenarLabel,
    sinOrdenarLabel,
    precioMenorLabel,
    precioMayorLabel,
    tamañoMenorLabel,
    tamañoMayorLabel,
    seEncontraronText,
    propiedadesText,
    noSeEncontraronText,
    noHayEnCategoriaText,
    noHayPropiedadesText
  ] = useMultipleTranslations(textsToTranslate)

  useEffect(() => {
    fetchViviendas()
    fetchImages()
  }, [])

  const fetchViviendas = async () => {
    try {
      const { data, error } = await supabase
        .from('viviendas')
        .select('*')
        .order('inserted_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching viviendas:', error)
      } else {
        setViviendas(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('vivienda_images')
        .select('*')
      
      if (error) {
        console.error('Error fetching images:', error)
      } else {
        setImages(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar viviendas por categorías según los datos de Supabase
  const propiedadesDestacadas = viviendas.filter(v => v.is_featured === true)
  const alquileres = viviendas.filter(v => 
    v.is_rent === true || 
    (v.property_type && v.property_type.toLowerCase().includes('alquiler')) ||
    (v.name && v.name.toLowerCase().includes('alquiler'))
  )
  const viviendasUsadas = viviendas.filter(v => v.category === 'Usada')
  const sinEstrenar = viviendas.filter(v => v.category === 'Sin estrenar')
  const otros = viviendas.filter(v => v.category === 'Otro')

  // Función para parsear precios correctamente independientemente del formato
  const parsePrice = (priceString: string): number => {
    if (!priceString) return 0
    
    // Eliminar símbolos de moneda y espacios
    let cleanPrice = priceString.replace(/[€$£¥\s]/g, '')
    
    // Detectar si usa coma como separador decimal (formato europeo)
    // Si hay coma después del último punto, es formato europeo
    const lastDotIndex = cleanPrice.lastIndexOf('.')
    const lastCommaIndex = cleanPrice.lastIndexOf(',')
    
    if (lastCommaIndex > lastDotIndex) {
      // Formato europeo: 1.449.000,00 -> usar coma como decimal
      cleanPrice = cleanPrice.replace(/\./g, '').replace(',', '.')
    } else if (lastDotIndex > lastCommaIndex) {
      // Formato americano: 1,449,000.00 -> usar punto como decimal
      cleanPrice = cleanPrice.replace(/,/g, '')
    } else {
      // Sin separadores decimales, solo eliminar comas de miles
      cleanPrice = cleanPrice.replace(/,/g, '')
    }
    
    return parseFloat(cleanPrice) || 0
  }

  // Filtrar viviendas según categoría y ordenamiento
  const getFilteredViviendas = () => {
    let filtered = viviendas

    // Filtrar por categoría
    switch (activeCategory) {
      case 'destacadas':
        filtered = filtered.filter(v => v.is_featured === true)
        break
      case 'alquileres':
        filtered = filtered.filter(v => 
          v.is_rent === true || 
          (v.property_type && v.property_type.toLowerCase().includes('alquiler')) ||
          (v.name && v.name.toLowerCase().includes('alquiler'))
        )
        break
      case 'usadas':
        filtered = filtered.filter(v => v.category === 'Usada')
        break
      case 'nuevas':
        filtered = filtered.filter(v => v.category === 'Sin estrenar')
        break
      case 'otros':
        filtered = filtered.filter(v => v.category === 'Otro')
        break
      default:
        // 'todas' - no filtrar
        break
    }

    // Ordenar según el criterio seleccionado
    switch (sortBy) {
      case 'price-asc':
        return filtered.sort((a, b) => {
          const priceA = parsePrice(a.price) || 0
          const priceB = parsePrice(b.price) || 0
          return priceA - priceB
        })
      case 'price-desc':
        return filtered.sort((a, b) => {
          const priceA = parsePrice(a.price) || 0
          const priceB = parsePrice(b.price) || 0
          return priceB - priceA
        })
      case 'm2-asc':
        return filtered.sort((a, b) => {
          const m2A = parsePrice(a.metros) || 0
          const m2B = parsePrice(b.metros) || 0
          return m2A - m2B
        })
      case 'm2-desc':
        return filtered.sort((a, b) => {
          const m2A = parsePrice(a.metros) || 0
          const m2B = parsePrice(b.metros) || 0
          return m2B - m2A
        })
      default:
        return filtered
    }
  }

  const filteredViviendas = getFilteredViviendas()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-100 via-teal-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-700 mx-auto mb-4"></div>
          <p className="text-teal-700 text-xl">{loadingText}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-teal-50 to-teal-100">
      {/* Banner Section */}
      <Banner
        title={bannerTitle}
        subtitle={bannerSubtitle}
        showCarousel={false}
        customImage="/banner/Fondo_LM.webp"
        height="medium"
      />

      {/* Filtros de categoría y ordenamiento */}
      <section className="px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Filtros por categoría */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2 sm:gap-3 lg:justify-center">
              {[
                { id: 'todas', label: todasLabel, count: viviendas.length },
                { id: 'destacadas', label: destacadasLabel, count: propiedadesDestacadas.length },
                { id: 'alquileres', label: alquileresLabel, count: alquileres.length },
                { id: 'usadas', label: usadasLabel, count: viviendasUsadas.length, shortLabel: 'Usadas' },
                { id: 'nuevas', label: nuevasLabel, count: sinEstrenar.length },
                { id: 'otros', label: otrosLabel, count: otros.length }
              ].map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-3 sm:px-4 lg:px-5 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 cursor-pointer transform hover:scale-105 text-sm sm:text-base ${
                    activeCategory === category.id
                      ? 'bg-teal-700 text-white shadow-md'
                      : 'bg-white/80 text-teal-700 hover:bg-teal-100 hover:shadow-md'
                  }`}
                >
                  <span className="truncate">
                    <span className="hidden sm:inline">{category.label}</span>
                    <span className="sm:hidden">{category.shortLabel || category.label}</span>
                  </span>
                  <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 ${
                    activeCategory === category.id
                      ? 'bg-white/20 text-white'
                      : 'bg-teal-100 text-teal-700'
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filtro de ordenamiento */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <label htmlFor="sort-select" className="text-teal-700 font-medium text-sm sm:text-base">{ordenarLabel}</label>
              <select
                id="sort-select"
                name="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm sm:text-base"
              >
                <option value="none">{sinOrdenarLabel}</option>
                <option value="price-asc">{precioMenorLabel}</option>
                <option value="price-desc">{precioMayorLabel}</option>
                <option value="m2-asc">{tamañoMenorLabel}</option>
                <option value="m2-desc">{tamañoMayorLabel}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <main id="propiedades-section" className="px-4 md:px-8 pb-12">
        {/* Contador de resultados */}
        <div className="mb-6 text-center max-w-7xl mx-auto">
          <p className="text-teal-700 text-lg">
            {filteredViviendas.length > 0 
              ? `${seEncontraronText} ${filteredViviendas.length} ${propiedadesText}`
              : noSeEncontraronText
            }
          </p>
        </div>

        {/* Propiedades */}
        <div className="max-w-7xl mx-auto">
          {filteredViviendas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredViviendas.map((vivienda) => (
                <div key={vivienda.id} className="relative">
                  <ViviendaCard 
                    vivienda={vivienda} 
                    images={images}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-2xl text-teal-700 mb-4">🏠</p>
              <p className="text-xl text-teal-600 mb-2">
                {noHayEnCategoriaText}
              </p>
            </div>
          )}
        </div>

        {/* Mensaje si no hay propiedades en total */}
        {viviendas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-2xl text-teal-700 mb-4">🏠</p>
            <p className="text-xl text-teal-600">{noHayPropiedadesText}</p>
          </div>
        )}
      </main>
    </div>
  )
}
