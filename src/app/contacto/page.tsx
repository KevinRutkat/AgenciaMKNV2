"use client";

import { useState } from "react";
import Banner from "@/components/Banner";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useMultipleTranslations } from "@/hooks/useTranslation";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  MapIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";

export default function ContactoPage() {
  const { isLoaded, loadError } = useGoogleMaps();

  const agencyLocation = {
    lat: 37.627368,
    lng: -0.710618,
  };

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    motivo: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const textsToTranslate = [
    // Banner
    "Contáctanos",
    "Estamos aquí para ayudarte con viviendas, terrenos o traducciones profesionales.",

    // Formulario
    "Envíanos un mensaje",
    "Te responderemos lo antes posible",
    "Nombre completo *",
    "Ingresa tu nombre completo",
    "Correo electrónico *",
    "tu@email.com",
    "Teléfono *",
    "+34 123 456 789",
    "Motivo del contacto *",
    "Cuéntanos tu consulta (compra, venta, alquiler, traducción, etc.)",
    "Enviando…",
    "Enviar mensaje",

    // Mensajes de estado
    "¡Gracias por contactarnos! Tu mensaje ha sido enviado y te responderemos pronto.",
    "Error al enviar el mensaje. Por favor intenta de nuevo.",

    // Información de contacto
    "Nuestra oficina",
    "Correo electrónico",
    "Teléfono",
    "Dirección",
    "Ctra. a Cabo de Palos, Km. 25",
    "30370 Cabo de Palos",
    "Murcia, España",
    "Horario de atención",
    "Trámites fuera de oficina: 9:00 - 12:00",
    "Lunes a viernes: 12:00 - 16:00",
    "Sábados: 11:00 - 14:00",
    "Domingo: Descanso",

    // Mapa
    "Ubicación",
    "Error cargando el mapa",
    "Cargando mapa…",
    "Ver en Google Maps",
  ];

  const [
    bannerTitle,
    bannerSubtitle,

    // Formulario
    formTitle,
    formSubtitle,
    nombreLabel,
    nombrePlaceholder,
    correoLabel,
    correoPlaceholder,
    telefonoLabel,
    telefonoPlaceholder,
    motivoLabel,
    motivoPlaceholder,
    enviandoText,
    enviarText,

    // Mensajes de estado
    successMessage,
    errorMessage,

    // Info contacto
    oficinaTitle,
    correoInfoLabel,
    telefonoInfoLabel,
    direccionLabel,
    direccion1,
    direccion2,
    direccion3,
    horarioLabel,
    horario1,
    horario2,
    horario3,
    horario4,

    // Mapa
    ubicacionTitle,
    errorCargandoMapa,
    cargandoMapa,
    mapaLink,
  ] = useMultipleTranslations(textsToTranslate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitMessage(successMessage);
        setFormData({
          nombre: "",
          correo: "",
          telefono: "",
          motivo: "",
        });
      } else {
        const errorData = await response.json();
        setSubmitMessage(errorData.error || errorMessage);
      }
    } catch {
      setSubmitMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-kehre-gradient-light">
      <Banner
        title={bannerTitle}
        subtitle={bannerSubtitle}
        height="medium"
        showCarousel={false}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Formulario */}
          <section
            aria-label="Formulario de contacto"
            className="bg-white rounded-2xl border border-neutral-gray shadow-sm p-6 h-fit"
          >
            <h2 className="text-2xl font-semibold text-neutral-dark mb-2">
              {formTitle}
            </h2>
            <p className="text-neutral-muted text-sm mb-4">{formSubtitle}</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="nombre"
                  className="block text-sm font-medium text-neutral-dark mb-1"
                >
                  {nombreLabel}
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                  placeholder={nombrePlaceholder}
                />
              </div>

              <div>
                <label
                  htmlFor="correo"
                  className="block text-sm font-medium text-neutral-dark mb-1"
                >
                  {correoLabel}
                </label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                  placeholder={correoPlaceholder}
                />
              </div>

              <div>
                <label
                  htmlFor="telefono"
                  className="block text-sm font-medium text-neutral-dark mb-1"
                >
                  {telefonoLabel}
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors"
                  placeholder={telefonoPlaceholder}
                />
              </div>

              <div>
                <label
                  htmlFor="motivo"
                  className="block text-sm font-medium text-neutral-dark mb-1"
                >
                  {motivoLabel}
                </label>
                <textarea
                  id="motivo"
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-colors resize-none"
                  placeholder={motivoPlaceholder}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-blue text-white py-2.5 px-6 rounded-full font-semibold hover-bg-primary-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmitting ? enviandoText : enviarText}
                </button>
              </div>

              {submitMessage && (
                <div
                  className={`p-3 rounded-lg text-center text-sm border ${
                    submitMessage.includes("Error")
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-green-50 text-green-700 border-green-200"
                  }`}
                >
                  {submitMessage}
                </div>
              )}
            </form>
          </section>

          {/* Info de contacto y mapa */}
          <div className="space-y-6">
            <section
              aria-label="Información de contacto"
              className="bg-white rounded-2xl border border-neutral-gray shadow-sm p-6"
            >
              <h2 className="text-2xl font-semibold text-neutral-dark mb-4">
                {oficinaTitle}
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-2">
                  <EnvelopeIcon className="h-5 w-5 text-neutral-muted flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-dark text-sm mb-1">
                      {correoInfoLabel}
                    </h3>
                    <p className="text-neutral-muted text-sm">
                      <a href="mailto:marionrutkat@gmail.com" className="hover:underline">
                        marionrutkat@gmail.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <PhoneIcon className="h-5 w-5 text-neutral-muted flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-dark text-sm mb-1">
                      {telefonoInfoLabel}
                    </h3>
                    <p className="text-neutral-muted text-sm">
                      <a href="tel:+34634737949" className="hover:underline">
                        +34 634 73 79 49
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPinIcon className="h-5 w-5 text-neutral-muted flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-dark text-sm mb-1">
                      {direccionLabel}
                    </h3>
                    <p className="text-neutral-muted text-sm">{direccion1}</p>
                    <p className="text-neutral-muted text-sm">{direccion2}</p>
                    <p className="text-neutral-muted text-sm">{direccion3}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <ClockIcon className="h-5 w-5 text-neutral-muted flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-dark text-sm mb-1">
                      {horarioLabel}
                    </h3>
                    <p className="text-neutral-muted text-sm">{horario1}</p>
                    <p className="text-neutral-muted text-sm">{horario2}</p>
                    <p className="text-neutral-muted text-sm">{horario3}</p>
                    <p className="text-neutral-muted text-sm">{horario4}</p>
                  </div>
                </div>
              </div>
            </section>

            <section
              aria-label="Mapa de ubicación"
              className="bg-white rounded-2xl border border-neutral-gray shadow-sm p-6"
            >
              <h2 className="text-2xl font-semibold text-neutral-dark mb-4">
                {ubicacionTitle}
              </h2>

              <div className="relative h-64 rounded-lg overflow-hidden border border-neutral-gray">
                {isLoaded && !loadError ? (
                  <GoogleMap
                    mapContainerStyle={{ height: "100%", width: "100%" }}
                    zoom={15}
                    center={agencyLocation}
                    options={{
                      disableDefaultUI: false,
                      zoomControl: true,
                      streetViewControl: true,
                      mapTypeControl: true,
                      fullscreenControl: true,
                      gestureHandling: "cooperative",
                    }}
                  >
                    <Marker
                      position={agencyLocation}
                      title="Agencia MKN - Inmobiliaria y Servicios de Traducción"
                    />
                  </GoogleMap>
                ) : (
                  <div className="w-full h-full bg-neutral-light flex items-center justify-center">
                    <div className="text-center text-neutral-muted">
                      <MapIcon className="h-10 w-10 text-primary-blue mx-auto mb-4" />
                      <p className="text-lg font-semibold">
                        {loadError ? errorCargandoMapa : cargandoMapa}
                      </p>
                      <p className="text-sm opacity-70">Cabo de Palos, Cartagena</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 text-center">
                <a
                  href="https://maps.google.com/?q=Agencia+MKN+Cabo+de+Palos+Murcia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary-blue text-white rounded-full hover-bg-primary-blue-dark transition-colors text-sm"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  {mapaLink}
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
