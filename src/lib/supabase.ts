import { createClient } from '@supabase/supabase-js'
import { AUTH_CONFIG } from './config'

// Cliente simple para el frontend (igual al que funciona)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cbmcapwcbeeorpmlyqbe.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNibWNhcHdjYmVlb3JwbWx5cWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjQ3NjIsImV4cCI6MjA2MDY0MDc2Mn0.hn0rt4JQDH8pmig1dfyhUHp0Hu3OA3jT9_fFaPRGhqI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Configuración de sesión para durar 12 horas (43200 segundos)
    ...AUTH_CONFIG,
    // Nota: El tiempo exacto de expiración (12 horas) debe configurarse 
    // en el Dashboard de Supabase: Authentication → Settings → JWT expiry: 43200
  }
})

// Types para las viviendas según la estructura de la imagen
export interface Vivienda {
  id: number
  category: string
  name: string
  descripcion: string
  price: string
  oldprice?: string
  metros: string
  habitaciones: number
  bathroom: number
  location: string
  lat: number
  lng: number
  property_type: string
  inserted_at: string
  propiedades: string
  details?: string[] // Campo para array de características en PostgreSQL
  is_rent: boolean
  plantas: number
  is_featured: boolean
}

export interface ViviendaImage {
  id: number
  vivienda_id: number
  url: string
  inserted_at: string
}
