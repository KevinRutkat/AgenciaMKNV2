"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Vivienda, ViviendaImage, supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useMultipleTranslations } from "@/hooks/useTranslation";
import {
  formatListingPrice,
  getRentPricePeriod,
  isRentListing,
  normalizeCategory,
} from "@/lib/viviendaUtils";
import { getPropertySpecialStatus } from "@/lib/propertySpecialStatus";
import {
  PencilSquareIcon,
  TrashIcon,
  PhotoIcon,
  MapPinIcon,
  TagIcon,
  ArrowsPointingOutIcon,
  Squares2X2Icon,
  BeakerIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon, ClockIcon, StarIcon } from "@heroicons/react/24/solid";

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

  const primaryImage = images.find((img) => img.vivienda_id === vivienda.id);

  const textsToTranslate = [
    "Editar propiedad",
    "Eliminar propiedad",
    "Sin imagen",
    "Destacado",
    "Usada",
    "Sin estrenar",
    "Otro",
    "Alquiler",
    "Propiedad",
    "hab.",
    "baños",
    "¿Está seguro de que desea eliminar esta propiedad? Esta acción no se puede deshacer.",
    "Error: No hay sesión activa",
    "Error al eliminar la propiedad",
    "Vendido",
    "Reservado",
    vivienda.descripcion,
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
    reserved,
    translatedDescription,
  ] = mounted ? translations : textsToTranslate;

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

  const normalizedCategory = normalizeCategory(vivienda.category);
  const isRent = isRentListing(vivienda);
  const rentPricePeriod = getRentPricePeriod(vivienda);
  const specialStatus = getPropertySpecialStatus(vivienda);
  const shouldDimImage =
    specialStatus === "sold" || specialStatus === "reserved";
  const specialBadge =
    specialStatus === "sold"
      ? {
          label: sold,
          color: "bg-neutral-dark",
          Icon: CheckBadgeIcon,
        }
      : specialStatus === "reserved"
        ? {
            label: reserved,
            color: "bg-red-600",
            Icon: ClockIcon,
          }
        : specialStatus === "featured"
          ? {
              label: featured,
              color: "bg-accent-coral",
              Icon: StarIcon,
            }
          : null;
  const SpecialBadgeIcon = specialBadge?.Icon;

  const getCategoryBadge = () => {
    if (normalizedCategory === "usada")
      return { label: used, color: "bg-primary-blue" };
    if (normalizedCategory === "sin-estrenar")
      return { label: brandNew, color: "bg-primary-green" };
    if (normalizedCategory === "otro")
      return { label: other, color: "bg-accent-coral" };

    if (isRent) {
      return { label: rental, color: "bg-accent-coral" };
    }

    return { label: property, color: "bg-primary-blue" };
  };

  const categoryBadge = getCategoryBadge();

  return (
    <article className="bg-white rounded-2xl border border-neutral-gray overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative group">
      {user && (
        <div className="absolute bottom-2 right-2 z-30 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleEdit}
            className="bg-primary-blue text-white p-1.5 rounded-full shadow-sm hover-bg-primary-blue-dark transition-colors text-xs"
            title={editProperty}
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-accent-coral text-white p-1.5 rounded-full shadow-sm hover-bg-accent-coral-dark transition-colors disabled:opacity-50 text-xs"
            title={deleteProperty}
          >
            {isDeleting ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <TrashIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      )}

      <div
        onClick={handleClick}
        className="relative h-56 sm:h-56 md:h-60 bg-neutral-light flex-shrink-0 cursor-pointer overflow-hidden"
      >
        {primaryImage ? (
          <>
            <Image
              src={primaryImage.url}
              alt={`${vivienda.name} en ${vivienda.location}`}
              fill
              quality={92}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, (max-width: 1280px) 45vw, 36vw"
              className={`object-cover transition-transform duration-500 group-hover:scale-110 ${shouldDimImage ? "opacity-60" : ""}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[1]" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-muted">
            <span className="inline-flex items-center gap-2">
              <PhotoIcon className="h-4 w-4" />
              <span>{noImage}</span>
            </span>
          </div>
        )}

        <div className="absolute bottom-2 left-2 z-10 flex flex-col gap-1 pointer-events-none md:hidden">
          <div className="bg-white shadow-lg px-3 py-2 rounded-xl">
            <span className="block text-neutral-dark font-bold text-xl leading-none whitespace-nowrap">
              {formatListingPrice(vivienda.price, isRent, rentPricePeriod)}
            </span>
            {vivienda.oldprice && (
              <span className="block text-xs text-accent-coral line-through leading-tight mt-1 font-medium whitespace-nowrap">
                {formatListingPrice(vivienda.oldprice, isRent, rentPricePeriod)}
              </span>
            )}
          </div>
        </div>

        {specialBadge && SpecialBadgeIcon && (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <span
              className={`inline-flex items-center gap-1.5 ${specialBadge.color} text-white text-xs px-2 py-1 rounded-full font-semibold`}
            >
              <SpecialBadgeIcon className="h-3.5 w-3.5" />
              {specialBadge.label}
            </span>
          </div>
        )}

        <div className="absolute top-2 right-2 z-10 pointer-events-none">
          <span className={`${categoryBadge.color} text-white text-xs px-2 py-1 rounded-full font-semibold`}>
            {categoryBadge.label}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3
          onClick={handleClick}
          className="text-base sm:text-lg font-semibold text-neutral-dark mb-1 line-clamp-1 cursor-pointer hover-text-primary-blue transition-colors"
        >
          {vivienda.name}
        </h3>

        <p className="text-neutral-muted text-sm mb-1 flex items-center gap-2 min-w-0">
          <MapPinIcon className="h-4 w-4 text-neutral-muted shrink-0" />
          <span className="truncate min-w-0 flex-1">{vivienda.location}</span>
        </p>

        {vivienda.property_type && (
          <p className="text-neutral-muted text-xs mb-2 capitalize inline-flex items-center gap-1.5">
            <TagIcon className="h-4 w-4 text-neutral-muted" />
            <span>{vivienda.property_type}</span>
          </p>
        )}

        <p className="text-neutral-muted text-sm mb-3 line-clamp-1 sm:line-clamp-2 flex-1">
          {translatedDescription}
        </p>

        <div className="flex gap-2 mb-4">
          <div
            className="flex items-center gap-1.5 bg-neutral-light rounded-lg px-2.5 py-1.5 text-xs text-neutral-muted"
            title={vivienda.metros ? `${vivienda.metros} m²` : "N/A"}
          >
            <ArrowsPointingOutIcon className="h-3.5 w-3.5 text-primary-blue shrink-0" />
            <span className="font-semibold text-neutral-dark">
              {vivienda.metros ? `${vivienda.metros} m²` : "—"}
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 bg-neutral-light rounded-lg px-2.5 py-1.5 text-xs text-neutral-muted"
            title={vivienda.habitaciones ? `${vivienda.habitaciones} ${bedrooms}` : "N/A"}
          >
            <Squares2X2Icon className="h-3.5 w-3.5 text-primary-blue shrink-0" />
            <span className="font-semibold text-neutral-dark">
              {vivienda.habitaciones ? vivienda.habitaciones : "—"}
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 bg-neutral-light rounded-lg px-2.5 py-1.5 text-xs text-neutral-muted"
            title={vivienda.bathroom ? `${vivienda.bathroom} ${bathrooms}` : "N/A"}
          >
            <BeakerIcon className="h-3.5 w-3.5 text-primary-blue shrink-0" />
            <span className="font-semibold text-neutral-dark">
              {vivienda.bathroom ? vivienda.bathroom : "—"}
            </span>
          </div>
        </div>

        <div className="hidden md:block mt-auto pt-2 border-t border-neutral-gray">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-neutral-dark leading-none">
                {formatListingPrice(vivienda.price, isRent, rentPricePeriod)}
              </span>
              {vivienda.oldprice && (
                <span className="text-sm text-accent-coral line-through leading-tight mt-1">
                  {formatListingPrice(vivienda.oldprice, isRent, rentPricePeriod)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
