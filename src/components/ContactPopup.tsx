'use client'

interface ContactPopupProps {
  onClose: () => void
}

export default function ContactPopup({ onClose }: ContactPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Botón de cerrar - mejorado */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full text-lg font-bold transition-all duration-200 z-10 shadow-sm"
          aria-label="Cerrar popup"
        >
          ✕
        </button>
        
        {/* Título - con espacio para el botón X */}
        <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center pr-8">
          📞 Información de Contacto
        </h2>
        
        {/* Información de la inmobiliaria */}
        <div className="space-y-4">
          {/* Teléfono */}
          <div className="flex items-center space-x-3 p-3 bg-teal-50 rounded-lg">
            <span className="text-2xl">📱</span>
            <div>
              <p className="font-semibold text-teal-800">Teléfono</p>
              <a href="tel:+34634737949" className="text-teal-600 hover:text-teal-800">
                +34 634 737 949
              </a>
            </div>
          </div>
          
          {/* Email */}
          <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
            <span className="text-2xl">📧</span>
            <div>
              <p className="font-semibold text-orange-800">Email</p>
              <a href="mailto:marionrutkat@gmail.com" className="text-orange-600 hover:text-orange-800">
                marionrutkat@gmail.com
              </a>
            </div>
          </div>
          
          {/* Ubicación */}
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-2xl">📍</span>
            <div>
              <p className="font-semibold text-blue-800">Ubicación</p>
              <p className="text-blue-600">
                Ctra. a Cabo de Palos, Km. 25,<br />
                30370 Cabo de Palos, Murcia
              </p>
            </div>
          </div>

          {/* Horario */}
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <span className="text-2xl">🕒</span>
            <div>
              <p className="font-semibold text-green-800">Horario</p>
              <p className="text-green-600">
                Lun - Sáb: 12:00 - 17:00
              </p>
            </div>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="flex space-x-3 mt-6">
          <a
            href="tel:+34634737949"
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg text-center font-semibold transition-colors"
          >
            📱 Llamar
          </a>
          <a
            href="mailto:marionrutkat@gmail.com"
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-center font-semibold transition-colors"
          >
            📧 Email
          </a>
        </div>
      </div>
    </div>
  )
}
