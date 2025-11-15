"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import Logo from "./Logo";
import { useTranslation } from "@/hooks/useTranslation";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, getSessionInfo } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<{
    isValid: boolean;
    timeLeft: string | null;
  } | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Traducciones para el header
  const inicioTextTranslated = useTranslation("Inicio");
  const propiedadesTextTranslated = useTranslation("Propiedades");
  const serviciosTextTranslated = useTranslation("Servicios");
  const contactoTextTranslated = useTranslation("Contacto");
  const añadirPropiedadTextTranslated = useTranslation("➕ Añadir Propiedad");
  const cerrarSesionTextTranslated = useTranslation("🚪 Cerrar Sesión");

  // Fallback de texto hasta que hydrate el cliente
  const inicioText = mounted ? inicioTextTranslated : "Inicio";
  const propiedadesText = mounted ? propiedadesTextTranslated : "Propiedades";
  const serviciosText = mounted ? serviciosTextTranslated : "Servicios";
  const contactoText = mounted ? contactoTextTranslated : "Contacto";
  const añadirPropiedadText = mounted
    ? añadirPropiedadTextTranslated
    : "➕ Añadir Propiedad";
  const cerrarSesionText = mounted
    ? cerrarSesionTextTranslated
    : "🚪 Cerrar Sesión";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Actualizar información de sesión cada minuto
  useEffect(() => {
    if (!user) {
      setSessionInfo(null);
      return;
    }

    const updateSessionInfo = () => {
      const info = getSessionInfo();
      setSessionInfo(info);
    };

    updateSessionInfo();
    const interval = setInterval(updateSessionInfo, 60000);

    return () => clearInterval(interval);
  }, [user, getSessionInfo]);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const getLinkClasses = (path: string) => {
    const base =
      "px-2 py-1.5 text-sm font-medium transition-colors rounded-md";
    if (isActive(path)) {
      return `${base} text-black border-b-2 border-accent-coral`;
    }
    return `${base} text-gray-700 hover:text-black`;
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
    } catch (e) {
      console.error("Error al cerrar sesión", e);
    } finally {
      setSigningOut(false);
      router.push("/");
      router.refresh();
    }
  };

  return (
    <header className="bg-white backdrop-blur shadow border-b border-neutral-gray sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Navegación principal">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Logo size="medium" showText={true} />
            </Link>
          </div>

          {/* Navegación escritorio */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={getLinkClasses("/")}
              aria-current={isActive("/") ? "page" : undefined}
            >
              {inicioText}
            </Link>
            <Link
              href="/propiedades"
              className={getLinkClasses("/propiedades")}
              aria-current={isActive("/propiedades") ? "page" : undefined}
            >
              {propiedadesText}
            </Link>
            <Link
              href="/servicios"
              className={getLinkClasses("/servicios")}
              aria-current={isActive("/servicios") ? "page" : undefined}
            >
              {serviciosText}
            </Link>
            <Link
              href="/contacto"
              className={getLinkClasses("/contacto")}
              aria-current={isActive("/contacto") ? "page" : undefined}
            >
              {contactoText}
            </Link>
          </div>

          {/* Acciones usuario escritorio */}
          {user && (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/propiedades/add"
                className="inline-flex items-center gap-1 rounded-full bg-primary-blue text-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-primary-blue-dark transition-colors"
              >
                {añadirPropiedadText}
              </Link>
              {sessionInfo && sessionInfo.isValid && (
                <div className="px-2.5 py-1 text-xs bg-primary-green-light text-primary-green-dark rounded-full border border-primary-green/70">
                  ⏰ {sessionInfo.timeLeft}
                </div>
              )}
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                aria-busy={signingOut}
                className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-accent-coral hover:bg-accent-coral hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {signingOut ? "Cerrando…" : cerrarSesionText}
              </button>
            </div>
          )}

          {/* Botón menú móvil */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-blue transition-colors"
              aria-expanded={isMobileMenuOpen}
              aria-label="Abrir menú principal"
              aria-controls="mobile-main-menu"
            >
              <span className="sr-only">Abrir menú principal</span>
              {/* Icono hamburguesa */}
              <svg
                className={`${isMobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icono cerrar */}
              <svg
                className={`${isMobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        <div
          id="mobile-main-menu"
          className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-neutral-gray">
            <Link
              href="/"
              className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                isActive("/")
                  ? "text-primary-blue bg-primary-blue/10 border-l-4 border-primary-blue"
                  : "text-gray-700 hover:text-black hover:bg-gray-100"
              }`}
              aria-current={isActive("/") ? "page" : undefined}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {inicioText}
            </Link>
            <Link
              href="/propiedades"
              className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                isActive("/propiedades")
                  ? "text-primary-blue bg-primary-blue/10 border-l-4 border-primary-blue"
                  : "text-gray-700 hover:text-black hover:bg-gray-100"
              }`}
              aria-current={isActive("/propiedades") ? "page" : undefined}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {propiedadesText}
            </Link>
            <Link
              href="/servicios"
              className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                isActive("/servicios")
                  ? "text-primary-blue bg-primary-blue/10 border-l-4 border-primary-blue"
                  : "text-gray-700 hover:text-black hover:bg-gray-100"
              }`}
              aria-current={isActive("/servicios") ? "page" : undefined}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {serviciosText}
            </Link>
            <Link
              href="/contacto"
              className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                isActive("/contacto")
                  ? "text-primary-blue bg-primary-blue/10 border-l-4 border-primary-blue"
                  : "text-gray-700 hover:text-black hover:bg-gray-100"
              }`}
              aria-current={isActive("/contacto") ? "page" : undefined}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {contactoText}
            </Link>

            {/* Acciones de usuario móvil */}
            {user && (
              <div className="pt-4 border-t border-neutral-gray space-y-2">
                <Link
                  href="/propiedades/add"
                  className="block w-full text-left px-3 py-2 text-base font-medium text-white bg-primary-blue rounded-md hover:bg-primary-blue-dark transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {añadirPropiedadText}
                </Link>
                {sessionInfo && sessionInfo.isValid && (
                  <div className="px-3 py-2 text-sm bg-primary-green-light text-primary-green-dark rounded-md border border-primary-green/70">
                    ⏰ Sesión: {sessionInfo.timeLeft}
                  </div>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={signingOut}
                  aria-busy={signingOut}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-accent-coral hover:bg-accent-coral hover:text-white rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {signingOut ? "Cerrando Sesión…" : cerrarSesionText}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
