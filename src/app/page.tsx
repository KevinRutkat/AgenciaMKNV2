import Image from "next/image";
import Link from "next/link";
import MapSection from "@/components/MapSection";
import Banner from "@/components/Banner";


export default function Home() {
  return (
    <div className="min-h-screen bg-kehre-gradient-light">
      {/* Banner del Faro / Hero principal */}
      <Banner
        title="Agencia Inmobiliaria y Servicios de Traducción en Cabo de Palos"
        subtitle="Gestión inmobiliaria profesional y servicios de traducción especializada en La Manga, Cartagena y Alicante. Tu agencia de confianza para compra, venta, alquiler de propiedades y traducción de todo tipo."
        buttonText="Ver Propiedades"
        buttonLink="/propiedades"
        secondButtonText="Ver Servicios"
        secondButtonLink="/servicios"
        showCarousel={true}
      />

      {/* Contenido principal */}
      <main className="px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Sección: Quiénes somos */}
          <section className="mb-12 sm:mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                  🏡 Sobre Agencia MKN
                </h2>
                <p className="text-base sm:text-lg text-gray-700 mb-3 leading-relaxed">
                  Agencia MKN es una inmobiliaria especializada en vivienda a lo
                  largo de Cabo de Palos, Cartagena y Alicante. Nos dedicamos a
                  ayudar y apoyar a nuestros clientes en todas sus gestiones
                  inmobiliarias, desde la búsqueda de la vivienda hasta la firma
                  del contrato, convirtiéndonos en una agencia completa y
                  profesional.
                </p>
                <p className="text-base sm:text-lg text-gray-700 mb-3 leading-relaxed">
                  Ubicados estratégicamente en Cabo de Palos, ofrecemos gestión
                  inmobiliaria integral: compraventa, alquiler, documentación,
                  asesoramiento legal y acompañamiento personalizado durante
                  todo el proceso.
                </p>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Como agencia ubicada en una zona multicultural, también
                  destacamos por nuestros servicios de traducción profesional en
                  español, alemán e inglés. Ofrecemos traducción presencial y
                  especializada en gestiones administrativas, cuestiones médicas
                  y procedimientos legales.
                </p>
              </div>
              <div className="relative h-80 sm:h-96 rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/FotoLocal.jpg"
                  alt="Foto de Agencia MKN - Oficina en Cabo de Palos"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
          </section>

          {/* Sección: Nuestra ubicación */}
          <section className="mb-12 sm:mb-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">
                📍 Nuestra Ubicación
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Texto de ubicación */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    🌊 Cabo de Palos, Cartagena
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    Ubicados en el privilegiado enclave de Cabo de Palos,
                    conocido por sus aguas cristalinas y su proximidad a la
                    Reserva Marina de Islas Hormigas, ofrecemos las mejores
                    oportunidades inmobiliarias en La Manga del Mar Menor y
                    toda la región de Cartagena.
                  </p>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    En Agencia MKN, nuestro mayor valor es la relación de
                    confianza que establecemos con cada cliente. Nos
                    comprometemos a ofrecer una experiencia inigualable, basada
                    en la transparencia, la profesionalidad y el trato cercano
                    que nos caracteriza.
                  </p>
                  <div className="space-y-2 text-gray-700">
                    <p className="flex items-center">
                      <span className="mr-3">📍</span>
                      <strong className="mr-2">Dirección:</strong>
                      Ctra. a Cabo de Palos, Km. 25, 30370 Cabo de Palos, Murcia
                    </p>
                    <p className="flex items-center">
                      <span className="mr-3">📞</span>
                      <strong className="mr-2">Teléfono:</strong>
                      <a
                        href="tel:+34634737949"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        +34 634 73 79 49
                      </a>
                    </p>
                    <p className="flex items-center">
                      <span className="mr-3">📧</span>
                      <strong className="mr-2">Email:</strong>
                      <a
                        href="mailto:marionrutkat@gmail.com"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        marionrutkat@gmail.com
                      </a>
                    </p>
                  </div>
                </div>

                {/* Mapa (cargado sólo en cliente) */}
                <MapSection />
              </div>
            </div>
          </section>

          {/* Sección: Nuestros servicios */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
              ⭐ Nuestros Servicios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg text-center transform hover:scale-105 transition-all duration-300 border border-gray-200">
                <div className="text-4xl mb-4">🔑</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Gestión Inmobiliaria Integral
                </h3>
                <p className="text-gray-700">
                  Gestión completa de compraventa y alquiler. Nos encargamos de
                  todos los trámites, documentación, asesoramiento legal y
                  acompañamiento personalizado durante todo el proceso.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center transform hover:scale-105 transition-all duration-300 border border-gray-200">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Servicios de Traducción
                </h3>
                <p className="text-gray-700">
                  Traducción profesional en español, alemán e inglés. Ofrecemos
                  traducción en gestiones oficiales como Hacienda o
                  Ayuntamientos, servicios notariales, traducción médica y
                  hospitalaria, así como traducción presencial en reuniones y
                  documentos inmobiliarios.
                </p>
              </div>
            </div>

            {/* Call to action Servicios */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center border border-blue-100 shadow-sm">
              <p className="text-gray-700 mb-4 text-lg">
                ¿Necesitas más información sobre nuestros servicios?
              </p>
              <Link
                href="/servicios"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <span className="mr-2">📋</span>
                Ver Servicios
                <span className="ml-2">→</span>
              </Link>
            </div>
          </section>

          {/* Call to Action final */}
          <section className="text-center">
            <div className="bg-kehre-gradient rounded-xl p-8 text-white shadow-xl">
              <h2 className="text-3xl font-bold mb-4">
                📞 ¿Quieres contactar con nosotros?
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Estamos aquí para ayudarte con tus necesidades inmobiliarias y de
                traducción.
              </p>
              <Link
                href="/contacto"
                className="inline-block bg-white text-blue-800 px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:bg-gray-100"
              >
                Contáctanos
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
