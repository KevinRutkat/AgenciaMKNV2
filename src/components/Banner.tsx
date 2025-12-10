'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'


interface BannerProps {
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonLink?: string;
  secondButtonText?: string;
  secondButtonLink?: string;
  showCarousel?: boolean;
  customImage?: string;
  height?: 'small' | 'medium' | 'large' | 'custom';
  customHeight?: string;
}

export default function Banner({ 
  title, 
  subtitle, 
  buttonText, 
  buttonLink, 
  secondButtonText,
  secondButtonLink,
  showCarousel = false,
  customImage,
  height = 'large',
  customHeight
}: BannerProps) {
  // Array con las imágenes del banner
  const bannerImages = [
    "/banner/Fondo_Faro.webp",
    "/banner/Fondo_Faro2.webp", 
    "/banner/Fondo_LM.webp"
  ]

  // Estado para controlar la imagen actual
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Determinar qué imagen usar
  const imagesToUse = customImage ? [customImage] : bannerImages

  // Función para obtener la altura del banner
  const getHeightClasses = () => {
    if (customHeight) {
      return customHeight
    }
    
    switch (height) {
      case 'small':
        return 'h-[280px] sm:h-[350px] md:h-[400px] lg:h-[450px]'
      case 'medium':
        return 'h-[350px] sm:h-[450px] md:h-[500px] lg:h-[550px]'
      case 'large':
        return 'h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]'
      default:
        return 'h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]'
    }
  }

  // Effect para cambiar la imagen cada 5 segundos (solo si showCarousel es true y hay múltiples imágenes)
  useEffect(() => {
    if (!showCarousel || imagesToUse.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % imagesToUse.length
      )
    }, 5000) // 5 segundos

    return () => clearInterval(interval) // Limpiar el intervalo al desmontar
  }, [imagesToUse.length, showCarousel])

  return (
    <section className={`relative ${getHeightClasses()} overflow-hidden`}>
      {/* Renderizar todas las imágenes superpuestas o solo la primera */}
      {showCarousel && imagesToUse.length > 1 ? (
        imagesToUse.map((image, index) => (
          <Image
            key={index}
            src={image}
            alt="Costa con faro - Agencia Inmobiliaria MKN"
            fill
            className={`object-cover object-center transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ filter: 'blur(1px)' }}
            priority={index === 0} // Solo la primera imagen tiene priority
          />
        ))
      ) : (
        <Image
          src={imagesToUse[0]}
          alt="Costa con faro - Agencia Inmobiliaria MKN"
          fill
          className="object-cover object-center"
          style={{ filter: 'blur(1px)' }}
          priority
        />
      )}
      
      {/* Overlay con gradiente para mejor legibilidad del texto */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/40"></div>
      
      {/* Contenido sobre el banner */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 drop-shadow-lg leading-tight text-shadow-lg">
            {title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-4xl mx-auto drop-shadow-md leading-relaxed">
            {subtitle}
          </p>
          
          {/* Espacio adicional para contenido SEO futuro */}
          <div className="mb-6 sm:mb-8 max-w-5xl mx-auto">
            {/* Este espacio está reservado para contenido SEO adicional */}
          </div>
          
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            {buttonText && buttonLink && (
              <Link 
                href={buttonLink}
                className="inline-block bg-primary-blue hover-bg-primary-blue-dark text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer w-full sm:w-auto text-center"
              >
                {buttonText}
              </Link>
            )}
            
            {secondButtonText && secondButtonLink && (
              <Link 
                href={secondButtonLink}
                className="inline-block bg-accent-coral hover-bg-accent-coral-dark text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer w-full sm:w-auto text-center"
              >
                {secondButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Indicadores de navegación - solo si showCarousel es true y hay múltiples imágenes, ocultos en móvil */}
      {showCarousel && imagesToUse.length > 1 && (
        // Ocultamos los indicadores (puntos) en móviles y tablets pequeñas: solo se ven desde md en adelante
        <div className={`absolute left-1/2 transform -translate-x-1/2 hidden md:flex space-x-2 md:space-x-3 z-10 ${
          (buttonText || secondButtonText) 
            ? 'bottom-20 md:bottom-6' 
            : 'bottom-4 md:bottom-6'
        }`}>
          {imagesToUse.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-white scale-110' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
