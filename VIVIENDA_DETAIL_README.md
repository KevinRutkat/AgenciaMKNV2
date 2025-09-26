# Componente de Detalle de Vivienda

## Descripción
Este componente muestra la información completa de una vivienda individual cuando el usuario hace clic en una tarjeta de vivienda desde la página de propiedades.

## Funcionalidades Implementadas

### 1. **Navegación**
- ✅ Botón "Volver atrás" que regresa a la página anterior
- ✅ Redirección desde las tarjetas de vivienda usando el router de Next.js

### 2. **Galería de Imágenes**
- ✅ Imagen principal con aspecto 4:3
- ✅ Flechas de navegación izquierda/derecha para cambiar imágenes
- ✅ Indicador de posición actual (ej: "2 / 5")
- ✅ Preview clickeable de todas las imágenes en miniatura
- ✅ Destacado visual de la imagen actual en el preview
- ✅ Animaciones suaves con CSS personalizado

### 3. **Información Principal**
- ✅ Título de la vivienda
- ✅ Ubicación con icono
- ✅ Precio con precio anterior tachado (si existe)
- ✅ Tipo de operación (Venta/Alquiler)
- ✅ Tipo de propiedad

### 4. **Características**
- ✅ Grid con información clave:
  - Número de habitaciones
  - Número de baños  
  - Metros cuadrados
  - Número de plantas
- ✅ Código de referencia
- ✅ Botón de contacto (sin funcionalidad por ahora)

### 5. **Características Adicionales**
- ✅ Lista de propiedades/características parseadas desde el campo `propiedades`
- ✅ Presentación en grid responsive
- ✅ Iconos de viñetas personalizados

### 6. **Descripción**
- ✅ Texto completo de la descripción
- ✅ Preservación de saltos de línea con `whitespace-pre-line`

### 7. **Ubicación**
- ✅ Sección preparada para Google Maps
- ✅ Placeholder que muestra las coordenadas lat/lng
- ✅ Nota de "Implementación pendiente"

## Estructura de Archivos

```
src/
├── app/
│   └── propiedades/
│       ├── page.tsx                 # Lista de propiedades
│       └── [id]/
│           └── page.tsx             # Detalle de vivienda (NUEVO)
├── components/
│   └── ViviendaCard.tsx            # Tarjeta con navegación añadida
└── lib/
    └── supabase.ts                 # Tipos y configuración
```

## Rutas

- `/propiedades` - Lista de todas las propiedades
- `/propiedades/[id]` - Detalle de una propiedad específica

## Dependencias Añadidas

- `@heroicons/react` - Iconos para la interfaz

## Responsive Design

- ✅ Mobile-first approach
- ✅ Grid responsive que se adapta a diferentes tamaños de pantalla
- ✅ Imágenes que mantienen proporción
- ✅ Texto que se ajusta correctamente

## Implementaciones Futuras

### Google Maps
Para implementar Google Maps en el futuro, se deberá:

1. Obtener una API key de Google Maps
2. Instalar `@googlemaps/js-api-loader` o similar
3. Reemplazar el placeholder en la sección de ubicación
4. Usar las coordenadas `lat` y `lng` de la base de datos

### Botón de Contacto
El botón de contacto está preparado para futuras funcionalidades como:
- Modal de contacto
- Formulario de consulta
- WhatsApp integration
- Email directo

## Base de Datos

El componente utiliza las siguientes tablas de Supabase:

### `viviendas`
- `id` - Identificador único
- `name` - Nombre de la vivienda
- `location` - Ubicación
- `price` - Precio actual
- `oldprice` - Precio anterior (opcional)
- `habitaciones` - Número de habitaciones
- `bathroom` - Número de baños
- `metros` - Metros cuadrados
- `plantas` - Número de plantas
- `descripcion` - Descripción completa
- `propiedades` - Características separadas por comas
- `is_rent` - Booleano para venta/alquiler
- `property_type` - Tipo de propiedad
- `reference_code` - Código de referencia
- `lat`, `lng` - Coordenadas
- `is_featured` - Destacado

### `vivienda_images`
- `id` - Identificador único
- `vivienda_id` - FK a viviendas
- `url` - URL de la imagen
- `inserted_at` - Fecha de inserción

## Estilos CSS Personalizados

Se añadieron clases CSS personalizadas en `globals.css`:

- `.line-clamp-*` - Truncado de texto
- `.gallery-transition` - Transiciones suaves
- `.preview-image` - Efectos hover para previews
- `.gallery-nav-button` - Estilo de botones de navegación

## Testing

Para probar el componente:

1. Ejecutar `npm run dev`
2. Ir a `/propiedades`
3. Hacer clic en cualquier tarjeta de vivienda
4. Verificar que la navegación funciona correctamente
5. Probar la galería de imágenes si hay múltiples imágenes

## Performance

- ✅ Uso de `Image` de Next.js para optimización automática
- ✅ Lazy loading de imágenes
- ✅ Estados de loading apropiados
- ✅ Manejo de errores
