import { NextRequest, NextResponse } from 'next/server';
import { Translate } from '@google-cloud/translate/build/src/v2';

// Configurar el cliente de Google Translate
// Nota: Necesitarás configurar las credenciales de Google Cloud
const translate = new Translate({
  // Si tienes una clave de API, puedes usarla así:
  // key: process.env.GOOGLE_TRANSLATE_API_KEY,
  
  // O si tienes un archivo de credenciales JSON:
  // keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  
  // Para desarrollo, puedes usar la clave de API directamente
  key: process.env.GOOGLE_TRANSLATE_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Texto y idioma objetivo son requeridos' },
        { status: 400 }
      );
    }

    // Traducir el texto
    const [translation] = await translate.translate(text, {
      from: 'es', // Idioma fuente (español)
      to: targetLanguage, // Idioma objetivo
    });

    return NextResponse.json({
      translatedText: translation,
      originalText: text,
      targetLanguage,
    });

  } catch (error) {
    console.error('Error en la traducción:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor durante la traducción',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
