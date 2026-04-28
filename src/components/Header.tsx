"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import Logo from "./Logo";
import { useTranslation } from "@/hooks/useTranslation";
import {
  ClockIcon,
  HomeIcon,
  BuildingOffice2Icon,
  BriefcaseIcon,
  EnvelopeIcon,
  PlusCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

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
  const anadirPropiedadTextTranslated = useTranslation("Añadir propiedad");
  const cerrarSesionTextTranslated = useTranslation("Cerrar sesión");

  // Fallback de texto hasta que hydrate el cliente
  const inicioText = mounted ? inicioTextTranslated : "Inicio";
  const propiedadesText = mounted ? propiedadesTextTranslated : "Propiedades";
  const serviciosText = mounted ? serviciosTextTranslated : "Servicios";
  const contactoText = mounted ? contactoTextTranslated : "Contacto";
  const anadirPropiedadText = mounted
    ? anadirPropiedadTextTranslated
    : "Añadir propiedad";
  const cerrarSesionText = mounted
    ? cerrarSesionTextTranslated
    : "Cerrar sesión";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Actualizar informacion de sesion cada minuto
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
      "px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-full";
    if (isActive(path)) {
      return `${base} bg-primary-blue-light text-primary-blue-dark font-semibold`;
    }
    return `${base} text-neutral-muted hover-bg-neutral-light hover-text-neutral-dark`;
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

  const navLinks = [
    { path: "/", label: inicioText, Icon: HomeIcon },
    { path: "/propiedades", label: propiedadesText, Icon: BuildingOffice2Icon },
    { path: "/servicios", label: serviciosText, Icon: BriefcaseIcon },
    { path: "/contacto", label: contactoText, Icon: EnvelopeIcon },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-neutral-gray/60 shadow-[0_1px_8px_rgba(0,0,0,0.06)] sticky top-0 z-40">
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Navegación principal"
      >
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
                className="inline-flex items-center gap-2 rounded-full bg-primary-blue text-white px-3 py-1.5 text-sm font-medium shadow-sm hover-bg-primary-blue-dark transition-colors"
              >
                {anadirPropiedadText}
              </Link>
              {sessionInfo && sessionInfo.isValid && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-primary-blue-light text-primary-blue-dark rounded-full border border-neutral-gray">
                  <ClockIcon className="h-4 w-4" />
                  <span>{sessionInfo.timeLeft}</span>
                </div>
              )}
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                aria-busy={signingOut}
                className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-neutral-muted hover-text-neutral-dark hover-bg-neutral-gray transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {signingOut ? "Cerrando…" : cerrarSesionText}
              </button>
            </div>
          )}

          {/* Botón menú móvil */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full transition-all duration-200 ${
              isMobileMenuOpen
                ? "bg-primary-blue text-white shadow-md"
                : "bg-neutral-light text-neutral-muted hover-bg-neutral-gray"
            }`}
            aria-expanded={isMobileMenuOpen}
            aria-label="Abrir menú principal"
            aria-controls="mobile-main-menu"
          >
            {isMobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div id="mobile-main-menu" className="md:hidden mobile-menu-open pb-3">
            <div className="bg-white rounded-2xl border border-neutral-gray/60 shadow-xl overflow-hidden mt-2">
              {/* Links de navegación */}
              <div className="p-3 space-y-1">
                {navLinks.map(({ path, label, Icon }) => (
                  <Link
                    key={path}
                    href={path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-150 ${
                      isActive(path)
                        ? "bg-primary-blue text-white shadow-sm"
                        : "text-neutral-muted hover-bg-neutral-light hover-text-neutral-dark"
                    }`}
                    aria-current={isActive(path) ? "page" : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 ${
                        isActive(path) ? "text-white" : "text-primary-blue"
                      }`}
                    />
                    <span>{label}</span>
                    {isActive(path) && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                    )}
                  </Link>
                ))}
              </div>

              {/* Acciones de usuario */}
              {user && (
                <div className="px-3 pb-3 pt-2 border-t border-neutral-gray/50 space-y-2">
                  <Link
                    href="/propiedades/add"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-medium text-white bg-primary-blue rounded-xl hover-bg-primary-blue-dark transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <PlusCircleIcon className="h-5 w-5" />
                    {anadirPropiedadText}
                  </Link>
                  {sessionInfo?.isValid && (
                    <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-primary-blue-light text-primary-blue-dark rounded-xl">
                      <ClockIcon className="h-4 w-4" />
                      <span>Sesión: {sessionInfo.timeLeft}</span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={signingOut}
                    aria-busy={signingOut}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-neutral-muted hover-bg-neutral-light hover-text-neutral-dark rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    {signingOut ? "Cerrando sesión…" : cerrarSesionText}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
