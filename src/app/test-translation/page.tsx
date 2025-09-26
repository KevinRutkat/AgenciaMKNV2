'use client'

import { useState } from 'react';
import Link from 'next/link';

export default function TestTranslationPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testTranslation = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Hola mundo',
          targetLanguage: 'en',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Traducción exitosa: "${data.translatedText}"`);
      } else {
        setError(`❌ Error: ${data.error || 'Error desconocido'}`);
      }
    } catch (err) {
      setError(`❌ Error de conexión: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          🧪 Prueba de Traducción
        </h1>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-xl font-semibold mb-4">
            Verificar configuración de Google Translate API
          </h2>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Esta página prueba si la API de Google Cloud Translate está configurada correctamente.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">Texto a traducir:</h3>
              <p className="text-blue-700">&quot;Hola mundo&quot; → Inglés</p>
            </div>
          </div>

          <button
            onClick={testTranslation}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '🔄 Traduciendo...' : '🚀 Probar Traducción'}
          </button>

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{result}</p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-700">{error}</p>
              
              <div className="mt-4 text-sm text-red-600">
                <p className="font-medium">Posibles soluciones:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Verifica que Cloud Translation API esté habilitada en Google Cloud Console</li>
                  <li>Asegúrate de que tu API Key tenga permisos para Cloud Translation API</li>
                  <li>Revisa que tengas créditos disponibles en Google Cloud</li>
                  <li>Comprueba que la variable GOOGLE_TRANSLATE_API_KEY esté configurada</li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Configuración actual:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• API Key configurada: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? '✅ Sí' : '❌ No'}</p>
              <p>• Endpoint de traducción: /api/translate</p>
              <p>• Método: POST</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
