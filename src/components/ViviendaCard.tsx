"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Vivienda, ViviendaImage, supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useMultipleTranslations } from "@/hooks/useTranslation";

interface ViviendaCardProps {
  vivienda: Vivienda;
  images: ViviendaImage[];
  onEdit?: (vivienda: Vivienda) => void;
  onDelete?: (id: number) => void;
}

export default function ViviendaCard({
  vivienda,
  images,
  onEdit,
  onDelete,
}: ViviendaCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Primera imagen asociada a la vivienda
  const primaryImage = images.find((img) => img.vivienda_id === vivienda.id);

  // Traducciones
  const textsToTranslate = [
    "Editar propiedad",
    "Eliminar propiedad",
    "Sin imagen",
    "Destacado",
    "Usada",
    "Sin Estrenar",
    "Otro",
    "Alquiler",
    "Propiedad",
    "hab.",
    "baños",
    "¿Estás seguro de que quieres eliminar esta propiedad? Esta acción no se puede deshacer.",
    "Error: No hay sesión activa",
    "Error al eliminar la propiedad",
    "Vendido", // texto para el badge
    vivienda.descripcion, // descripción a traducir
  ];

  const translations = useMultipleTranslations(textsToTranslate);

  const [
    editProperty,
    deleteProperty,
    noImage,
    featured,
    used,
    brandNew,
    other,
    rental,
    property,
    bedrooms,
    bathrooms,
    confirmDelete,
    noSessionError,
    deleteError,
    sold,
    translatedDescription,
  ] = mounted
    ? translations
    : [
        "Editar propiedad",
        "Eliminar propiedad",
        "Sin imagen",
        "Destacado",
        "Usada",
        "Sin Estrenar",
        "Otro",
        "Alquiler",
        "Propiedad",
        "hab.",
        "baños",
        "¿Estás seguro de que quieres eliminar esta propiedad? Esta acción no se puede deshacer.",
        "Error: No hay sesión activa",
        "Error al eliminar la propiedad",
        "Vendido",
        vivienda.descripcion,
      ];

  const handleClick = () => {
    router.push(`/propiedades/${vivienda.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(vivienda);
    } else {
      router.push(`/propiedades/edit/${vivienda.id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm(confirmDelete)) return;

    setIsDeleting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert(noSessionError);
        setIsDeleting(false);
        return;
      }

      const response = await fetch(`/api/propiedades?id=${vivienda.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        if (onDelete) {
          onDelete(vivienda.id);
        } else {
          window.location.reload();
        }
      } else {
        const error = await response.json();
        alert(`${deleteError}: ${error.error}`);
      }
    } catch (error) {
      alert(`${deleteError}: ${error}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Badge de categoría
  const getCategoryBadge = () => {
    if (vivienda.category === "Usada")
      return { label: used, color: "bg-blue-500" };
    if (vivienda.category === "Sin estrenar")
      return { label: brandNew, color: "bg-primary-green" };
    if (vivienda.category === "Otro")
      return { label: other, color: "bg-primary-blue" };

    if (
      vivienda.is_rent ||
      (vivienda.category &&
        vivienda.category.toLowerCase().includes("alquiler")) ||
      (vivienda.property_type &&
        vivienda.property_type.toLowerCase().includes("alquiler")) ||
      (vivienda.name && vivienda.name.toLowerCase().includes("alquiler"))
    ) {
      return { label: rental, color: "bg-accent-coral" };
    }

    return { label: property, color: "bg-primary-blue" };
  };

  // Precio: mostrar tal cual viene, asegurando el símbolo €
  const displayPrice = (raw: string | null | undefined) => {
    if (!raw) return "";
    const cleaned = raw.replace(/\s+/g, "").replace(/\u00A0/g, "");
    if (/€$/.test(cleaned)) return cleaned;
    return `${cleaned}€`;
  };

  const categoryBadge = getCategoryBadge();

  return (
    <article className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 h-full flex flex-col relative group">
      {/* Botones admin */}
      {user && (
        <div className="absolute bottom-2 right-2 z-50 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleEdit}
            className="bg-primary-blue text-white p-1.5 rounded-full shadow-xl hover:bg-primary-blue-dark transition-colors text-xs"
            title={editProperty}
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-accent-coral text-white p-1.5 rounded-full shadow-xl hover:bg-accent-coral-dark transition-colors disabled:opacity-50 text-xs"
            title={deleteProperty}
          >
            {isDeleting ? "⏳" : "🗑️"}
          </button>
        </div>
      )}

      {/* Imagen */}
      <div
        onClick={handleClick}
        className="relative h-40 sm:h-48 md:h-52 bg-gray-200 flex-shrink-0 cursor-pointer"
      >
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={`${vivienda.name} en ${vivienda.location}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className={`object-cover ${
              vivienda.is_sold ? "opacity-50" : ""
            }`} // más opaco cuando está vendida
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span>📷 {noImage}</span>
          </div>
        )}

        {/* Precio overlay en móvil */}
        <div className="absolute bottom-1.5 left-1.5 z-30 flex flex-col gap-1 pointer-events-none md:hidden">
          <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.45)] ring-1 ring-white/15">
            <span className="block text-white font-black text-3xl leading-none tracking-tight whitespace-nowrap">
              {displayPrice(vivienda.price)}
            </span>
            {vivienda.oldprice && (
              <span className="block text-[10px] text-red-200/90 line-through leading-tight mt-1 font-medium whitespace-nowrap">
                {displayPrice(vivienda.oldprice)}
              </span>
            )}
          </div>
        </div>

        {/* 🟢 / ⭐ Top-left: solo uno (prioridad Vendido) */}
        {(vivienda.is_sold || vivienda.is_featured) && (
          <div className="absolute top-1 sm:top-2 left-1 sm:left-2 z-30 pointer-events-none">
            {vivienda.is_sold ? (
              <span className="bg-red-500 text-white text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold shadow-md">
                🔴 {sold}
              </span>
            ) : (
              <span className="bg-orange-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold shadow-md">
                ⭐ {featured}
              </span>
            )}
          </div>
        )}

        {/* Categoría (arriba derecha, sin tocar) */}
        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 z-30 pointer-events-none">
          <span
            className={`${categoryBadge.color} text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold shadow-md`}
          >
            {categoryBadge.label}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        {/* Nombre */}
        <h3
          onClick={handleClick}
          className="text-base sm:text-lg font-semibold text-neutral-dark mb-1 line-clamp-1 cursor-pointer hover:text-primary-blue transition-colors"
        >
          {vivienda.name}
        </h3>

        {/* Ubicación */}
        <p className="text-gray-600 text-sm mb-1 flex items-center">
          📍 {vivienda.location}
        </p>

        {/* Tipo de propiedad */}
        {vivienda.property_type && (
          <p className="text-gray-500 text-xs mb-2 capitalize">
            🏠 {vivienda.property_type}
          </p>
        )}

        {/* Descripción breve */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
          {translatedDescription}
        </p>

        {/* Detalles */}
        <div className="flex flex-wrap gap-3 md:gap-4 mb-4 text-sm text-gray-600">
          <div
            className="flex items-center gap-1.5"
            title={vivienda.metros ? `${vivienda.metros} m²` : "N/A"}
          >
            <span className="text-sm">📐</span>
            <span className="font-medium">
              {vivienda.metros ? `${vivienda.metros} m²` : "N/A"}
            </span>
          </div>
          <div
            className="flex items-center gap-1.5"
            title={
              vivienda.habitaciones
                ? `${vivienda.habitaciones} ${bedrooms}`
                : "N/A"
            }
          >
            <span className="text-sm">🛏️</span>
            <span className="font-medium">
              {vivienda.habitaciones
                ? `${vivienda.habitaciones} ${bedrooms}`
                : "N/A"}
            </span>
          </div>
          <div
            className="flex items-center gap-1.5"
            title={
              vivienda.bathroom
                ? `${vivienda.bathroom} ${bathrooms}`
                : "N/A"
            }
          >
            <span className="text-sm">🚿</span>
            <span className="font-medium">
              {vivienda.bathroom
                ? `${vivienda.bathroom} ${bathrooms}`
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Precio en desktop */}
        <div className="hidden md:block mt-auto pt-2 border-top border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-800 leading-none">
                {displayPrice(vivienda.price)}
              </span>
              {vivienda.oldprice && (
                <span className="text-sm text-red-500 line-through leading-tight mt-1">
                  {displayPrice(vivienda.oldprice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
