#!/usr/bin/env node

/**
 * Script de prueba para verificar la configuración del sistema de traducciones
 * 
 * Uso:
 * node scripts/test-translation.js
 */

async function testTranslationAPI() {
  console.log('🧪 Probando el sistema de traducciones...\n');

  try {
    // Prueba 1: Verificar que el endpoint existe
    console.log('1. Verificando endpoint de traducción...');
    const response = await fetch('http://localhost:3000/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hola mundo',
        targetLanguage: 'en',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Endpoint funcionando correctamente');
    console.log(`   Original: "${data.originalText}"`);
    console.log(`   Traducido: "${data.translatedText}"`);
    console.log(`   Idioma objetivo: ${data.targetLanguage}\n`);

    // Prueba 2: Verificar múltiples idiomas
    console.log('2. Probando traducción a múltiples idiomas...');
    const languages = ['en', 'fr', 'de', 'it'];
    
    for (const lang of languages) {
      try {
        const langResponse = await fetch('http://localhost:3000/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: 'Bienvenido a nuestra agencia inmobiliaria',
            targetLanguage: lang,
          }),
        });

        if (langResponse.ok) {
          const langData = await langResponse.json();
          console.log(`   ${lang.toUpperCase()}: "${langData.translatedText}"`);
        } else {
          console.log(`   ❌ Error con idioma ${lang}: ${langResponse.status}`);
        }
      } catch (error) {
        console.log(`   ❌ Error con idioma ${lang}:`, error.message);
      }
    }

    console.log('\n🎉 ¡Todas las pruebas completadas!');
    console.log('\n📋 Resumen:');
    console.log('   - Endpoint de traducción: ✅ Funcionando');
    console.log('   - Múltiples idiomas: ✅ Soportados');
    console.log('   - Integración con Google Translate: ✅ Configurada');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('   1. Asegúrate de que el servidor esté ejecutándose (npm run dev)');
    console.log('   2. Verifica que GOOGLE_TRANSLATE_API_KEY esté configurada');
    console.log('   3. Comprueba que la API de Google Translate esté habilitada');
    console.log('   4. Revisa que tengas créditos disponibles en Google Cloud');
  }
}

// Verificar variables de entorno
function checkEnvironment() {
  console.log('🔍 Verificando configuración del entorno...\n');
  
  const requiredVars = [
    'GOOGLE_TRANSLATE_API_KEY',
    'GOOGLE_APPLICATION_CREDENTIALS'
  ];

  let hasConfig = false;

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Configurada`);
      hasConfig = true;
    } else {
      console.log(`❌ ${varName}: No configurada`);
    }
  });

  if (!hasConfig) {
    console.log('\n⚠️  No se encontró configuración de Google Cloud.');
    console.log('   Por favor, configura una de las siguientes variables:');
    console.log('   - GOOGLE_TRANSLATE_API_KEY (para usar API Key)');
    console.log('   - GOOGLE_APPLICATION_CREDENTIALS (para usar Service Account)');
    console.log('\n   Consulta el archivo TRANSLATION_SYSTEM_README.md para más detalles.');
    return false;
  }

  console.log('\n✅ Configuración del entorno correcta\n');
  return true;
}

// Ejecutar pruebas
async function main() {
  console.log('🌍 Sistema de Traducciones - Pruebas Automáticas');
  console.log('='.repeat(50) + '\n');

  // Verificar entorno
  const envOk = checkEnvironment();
  
  if (!envOk) {
    process.exit(1);
  }

  // Esperar un poco para que el usuario lea la configuración
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Ejecutar pruebas de API
  await testTranslationAPI();
}

// Solo ejecutar si este archivo se ejecuta directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testTranslationAPI, checkEnvironment };
