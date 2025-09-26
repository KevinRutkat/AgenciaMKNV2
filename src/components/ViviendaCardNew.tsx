'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Vivienda, ViviendaImage } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useMultipleTranslations } from '@/hooks/useTranslation'

interface ViviendaCardProps {
  vivienda: Vivienda
  images: ViviendaImage[]
  onEdit?: (vivienda: Vivienda) => void
  onDelete?: (id: number) => void
}

export default function ViviendaCard({ vivienda, images, onEdit, onDelete }: ViviendaCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Obtener la primera imagen de la vivienda
  const primaryImage = images.find(img => img.vivienda_id === vivienda.id)
  
  // Traducciones
  const textsToTranslate = [
    '¿Estás seguro de que quieres eliminar esta propiedad? Esta acción no se puede deshacer.',
    'Error: No hay sesión activa',
    'Error al eliminar la propiedad',
    'hab.',
    'baños',
    'plantas',
    vivienda.descripcion // Agregar la descripción para traducir
  ]

  const translations = useMultipleTranslations(textsToTranslate)
  
  const [
    confirmDeleteText,
    noSessionText,
    deleteErrorText,
    habitacionesText,
    bañosText,
    plantasText,
    translatedDescription
  ] = mounted ? translations : [
    '¿Estás seguro de que quieres eliminar esta propiedad? Esta acción no se puede deshacer.',
    'Error: No hay sesión activa',
    'Error al eliminar la propiedad',
    'hab.',
    'baños',
    'plantas',
    vivienda.descripcion
  ]
  
  const handleClick = () => {
    router.push(`/propiedades/${vivienda.id}`)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que se active el click de la card
    if (onEdit) {
      onEdit(vivienda)
    } else {
      router.push(`/propiedades/edit/${vivienda.id}`)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm(confirmDeleteText)) {
      return
    }

    setIsDeleting(true)
    
    try {
      // Obtener el token de sesión actual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        alert(noSessionText);
        setIsDeleting(false);
        return;
      }

      const response = await fetch(`/api/propiedades?id=${vivienda.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        if (onDelete) {
          onDelete(vivienda.id)
        } else {
          // Recargar la página si no hay callback
          window.location.reload()
        }
      } else {
        const error = await response.json()
        alert(`${deleteErrorText}: ${error.error}`)
      }
    } catch (error) {
      alert(`${deleteErrorText}: ${error}`)
    } finally {
      setIsDeleting(false)
    }
  }
  
  // Mostrar el precio exactamente como viene de la base de datos (sin reformatear)
  const displayPrice = (raw: string | null | undefined) => {
    if (!raw) return ''
    const cleaned = raw.replace(/\s+/g, '').replace(/\u00A0/g, '')
    if (/€$/.test(cleaned)) return cleaned
    return `${cleaned}€`
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 h-full flex flex-col relative">
      {/* Botones de administración - solo visibles si está autenticado */}
      {user && (
        <div className="absolute bottom-2 right-2 z-50 flex gap-1">
          <button
            onClick={handleEdit}
            className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
            title="Editar propiedad"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            title="Eliminar propiedad"
          >
            {isDeleting ? '⏳' : '🗑️'}
          </button>
        </div>
      )}

      {/* Imagen de la vivienda */}
      <div 
        onClick={handleClick}
        className="relative h-48 bg-gray-200 flex-shrink-0 cursor-pointer"
      >
        {primaryImage ? (
          <Image 
            src={primaryImage.url} 
            alt={vivienda.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span>📷 Sin imagen</span>
          </div>
        )}

        {/* Precio overlay */}
        <div className="absolute bottom-2 left-2 z-30 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.45)] ring-1 ring-white/15">
            <span className="block text-white font-black text-3xl sm:text-4xl md:text-5xl leading-none tracking-tight whitespace-nowrap">
              {displayPrice(vivienda.price)}
            </span>
            {vivienda.oldprice && (
              <span className="block text-[10px] sm:text-xs text-red-200/90 line-through leading-tight mt-1 font-medium whitespace-nowrap">
                {displayPrice(vivienda.oldprice)}
              </span>
            )}
          </div>
        </div>

        {/* Badge de destacado */}
        {vivienda.is_featured && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            ⭐ Destacado
          </div>
        )}

        {/* Badge de alquiler */}
        {vivienda.is_rent && (
          <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            🏠 Alquiler
          </div>
        )}
      </div>
        
      {/* Contenido de la card */}
      <div 
        onClick={handleClick}
        className="p-4 flex-1 flex flex-col cursor-pointer"
      >
        {/* Nombre de la vivienda */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
          {vivienda.name}
        </h3>
        
        {/* Ubicación */}
        <p className="text-gray-600 text-sm mb-2 flex items-center">
          📍 {vivienda.location}
        </p>
        
        {/* Tipo de propiedad */}
        <p className="text-gray-600 text-xs mb-2 capitalize">
          🏠 {vivienda.property_type}
        </p>
        
        {/* Descripción breve */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
          {translatedDescription}
        </p>
        
        {/* Detalles: m2, habitaciones, baños, plantas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-[11px] sm:text-xs text-gray-600 bg-gray-50 p-2.5 sm:p-3 rounded-lg">
          <div className="flex items-center gap-1 truncate" title={vivienda.metros}>
            <span>📐</span>
            <span className="font-medium">{vivienda.metros}</span>
          </div>
          <div className="flex items-center gap-1 truncate" title={`${vivienda.habitaciones} ${habitacionesText}`}>
            <span>🛏️</span>
            <span className="font-medium">{vivienda.habitaciones} {habitacionesText}</span>
          </div>
          <div className="flex items-center gap-1 truncate" title={`${vivienda.bathroom} ${bañosText}`}>
            <span>🚿</span>
            <span className="font-medium">{vivienda.bathroom} {bañosText}</span>
          </div>
          <div className="flex items-center gap-1 truncate" title={`${vivienda.plantas} {plantasText}`}> 
            <span>🏗️</span>
            <span className="font-medium">{vivienda.plantas} {plantasText}</span>
          </div>
        </div>

        {/* Categoría (precio movido al overlay) */}
        <div className="mt-auto flex justify-end">
          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full capitalize font-medium">
            {vivienda.category}
          </span>
        </div>
      </div>
    </div>
  )
}
