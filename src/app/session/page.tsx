'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Banner from '@/components/Banner';

export default function SessionPage() {
  const { signIn, user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const { error: authError } = await signIn(formData.email, formData.password);
    
    if (authError) {
      setError('Credenciales incorrectas. Por favor, verifica tu email y contraseña.');
    } else {
      // El AuthContext se encargará de redirigir automáticamente
      router.push('/');
    }
    
    setIsSubmitting(false);
  };

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Banner Component */}
      <Banner 
        title="🔐 Acceso Administrador"
        subtitle="Inicia sesión para gestionar las propiedades de la web"
        height="small"
        showCarousel={false}
      />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-teal-800 mb-2">
              🏢 Portal de Administración
            </h2>
            <p className="text-gray-600">
              Accede con tus credenciales para gestionar las propiedades
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                📧 Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                placeholder="admin@agenciamkn.com"
              />
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                🔑 Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-100 text-red-700 border border-red-200 text-sm">
                ❌ {error}
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {isSubmitting ? '🔄 Iniciando sesión...' : '🚪 Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              🔒 Esta página es solo para administradores
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
