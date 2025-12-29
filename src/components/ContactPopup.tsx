"use client";

import {
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

interface ContactPopupProps {
  onClose: () => void;
}

export default function ContactPopup({ onClose }: ContactPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-xl border border-neutral-gray max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-neutral-light hover-bg-neutral-gray text-neutral-muted hover-text-neutral-dark rounded-full text-lg font-bold transition-all duration-200 z-10"
          aria-label="Cerrar popup"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>

        <h2 className="text-2xl font-semibold text-neutral-dark mb-6 text-center pr-8">
          <span className="inline-flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary-blue" />
            Información de contacto
          </span>
        </h2>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-neutral-light rounded-lg">
            <PhoneIcon className="h-5 w-5 text-neutral-muted" />
            <div>
              <p className="font-semibold text-neutral-dark">Teléfono</p>
              <a href="tel:+34634737949" className="text-primary-blue hover-text-primary-blue-dark">
                +34 634 737 949
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-neutral-light rounded-lg">
            <EnvelopeIcon className="h-5 w-5 text-neutral-muted" />
            <div>
              <p className="font-semibold text-neutral-dark">Email</p>
              <a href="mailto:marionrutkat@gmail.com" className="text-primary-blue hover-text-primary-blue-dark">
                marionrutkat@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-neutral-light rounded-lg">
            <MapPinIcon className="h-5 w-5 text-neutral-muted" />
            <div>
              <p className="font-semibold text-neutral-dark">Ubicación</p>
              <p className="text-neutral-muted">
                Ctra. a Cabo de Palos, Km. 25,<br />
                30370 Cabo de Palos, Murcia
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-neutral-light rounded-lg">
            <ClockIcon className="h-5 w-5 text-neutral-muted" />
            <div>
              <p className="font-semibold text-neutral-dark">Horario</p>
              <div className="text-neutral-muted text-sm">
                <p><strong>Trámites fuera de oficina:</strong> 9:00 - 12:00</p>
                <p><strong>Lunes a viernes:</strong> 12:00 - 16:00</p>
                <p><strong>Sábados:</strong> 11:00 - 14:00</p>
                <p><strong>Domingo:</strong> Descanso</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <a
            href="tel:+34634737949"
            className="flex-1 bg-primary-blue hover-bg-primary-blue-dark text-white py-2 px-4 rounded-full text-center font-semibold transition-colors"
          >
            Llamar
          </a>
          <a
            href="mailto:marionrutkat@gmail.com"
            className="flex-1 border border-neutral-gray text-neutral-dark py-2 px-4 rounded-full text-center font-semibold transition-colors hover-bg-neutral-gray"
          >
            Email
          </a>
        </div>
      </div>
    </div>
  );
}
