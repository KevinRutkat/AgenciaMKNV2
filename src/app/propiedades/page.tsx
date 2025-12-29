"use client";

import { useEffect, useState } from "react";
import { supabase, Vivienda, ViviendaImage } from "@/lib/supabase";
import ViviendaCard from "@/components/ViviendaCard";
import Banner from "@/components/Banner";
import { useMultipleTranslations } from "@/hooks/useTranslation";
import {
  Squares2X2Icon,
  KeyIcon,
  ArrowPathIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

export default function PropiedadesPage() {
  const [viviendas, setViviendas] = useState<Vivienda[]>([]);
  const [images, setImages] = useState<ViviendaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("todas");
  const [sortBy, setSortBy] = useState<string>("none");

  // Traducciones de la pagina
  const textsToTranslate = [
    // Banner
    "Propiedades y terrenos gestionados",
    "Explora viviendas y terrenos en Cabo de Palos, La Manga, Cartagena y Alicante.",

    // Estados de carga
    "Cargando propiedades…",

    // Filtros y categorias
    "Todas",
    "Destacadas",
    "Alquileres",
    "Usadas",
    "Sin estrenar",
    "Otros",
    "Ordenar por:",
    "Sin ordenar",
    "Precio: menor a mayor",
    "Precio: mayor a menor",
    "Tamaño: menor a mayor",
    "Tamaño: mayor a menor",

    // Mensajes de estado
    "Se encontraron",
    "propiedades",
    "No se encontraron propiedades",
    "No hay propiedades disponibles en esta categoría",
    "No hay propiedades disponibles en este momento",
  ];

  const [
    bannerTitle,
    bannerSubtitle,
    loadingText,
    todasLabel,
    destacadasLabel,
    alquileresLabel,
    usadasLabel,
    nuevasLabel,
    otrosLabel,
    ordenarLabel,
    sinOrdenarLabel,
    precioMenorLabel,
    precioMayorLabel,
    tamanoMenorLabel,
    tamanoMayorLabel,
    seEncontraronText,
    propiedadesText,
    noSeEncontraronText,
    noHayEnCategoriaText,
    noHayPropiedadesText,
  ] = useMultipleTranslations(textsToTranslate);

  useEffect(() => {
    fetchViviendas();
    fetchImages();
  }, []);

  const fetchViviendas = async () => {
    try {
      const { data, error } = await supabase
        .from("viviendas")
        .select("*")
        .order("inserted_at", { ascending: false });

      if (error) {
        console.error("Error fetching viviendas:", error);
      } else {
        setViviendas(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("vivienda_images")
        .select("*");

      if (error) {
        console.error("Error fetching images:", error);
      } else {
        setImages(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar viviendas por categorias segun los datos de Supabase
  const propiedadesDestacadas = viviendas.filter((v) => v.is_featured === true);

  const alquileres = viviendas.filter(
    (v) =>
      v.is_rent === true ||
      (v.category && v.category.toLowerCase() === "alquiler") ||
      (v.property_type &&
        v.property_type.toLowerCase().includes("alquiler")) ||
      (v.name && v.name.toLowerCase().includes("alquiler")),
  );

  const viviendasUsadas = viviendas.filter(
    (v) => v.category && v.category.toLowerCase() === "usada",
  );

  const sinEstrenar = viviendas.filter(
    (v) => v.category && v.category.toLowerCase() === "sin-estrenar",
  );

  const otros = viviendas.filter(
    (v) => v.category && v.category.toLowerCase() === "otro",
  );

  // Funcion para parsear precios correctamente independientemente del formato
  const parsePrice = (priceString: string): number => {
    if (!priceString) return 0;

    // Eliminar simbolos de moneda y espacios
    let cleanPrice = priceString.replace(/[€$\s]/g, "");

    // Detectar si usa coma como separador decimal (formato europeo)
    const lastDotIndex = cleanPrice.lastIndexOf(".");
    const lastCommaIndex = cleanPrice.lastIndexOf(",");

    if (lastCommaIndex > lastDotIndex) {
      // Formato europeo: 1.449.000,00 -> usar coma como decimal
      cleanPrice = cleanPrice.replace(/\./g, "").replace(",", ".");
    } else if (lastDotIndex > lastCommaIndex) {
      // Formato americano: 1,449,000.00 -> usar punto como decimal
      cleanPrice = cleanPrice.replace(/,/g, "");
    } else {
      // Sin separadores decimales, solo eliminar comas de miles
      cleanPrice = cleanPrice.replace(/,/g, "");
    }

    return parseFloat(cleanPrice) || 0;
  };

  // Filtrar viviendas segun categoria y ordenamiento
  const getFilteredViviendas = () => {
    let filtered = [...viviendas];

    // Filtrar por categoria
    switch (activeCategory) {
      case "destacadas":
        filtered = filtered.filter((v) => v.is_featured === true);
        break;
      case "alquileres":
        filtered = filtered.filter(
          (v) =>
            v.is_rent === true ||
            (v.category && v.category.toLowerCase() === "alquiler") ||
            (v.property_type &&
              v.property_type.toLowerCase().includes("alquiler")) ||
            (v.name && v.name.toLowerCase().includes("alquiler")),
        );
        break;
      case "usadas":
        filtered = filtered.filter(
          (v) => v.category && v.category.toLowerCase() === "usada",
        );
        break;
      case "nuevas":
        filtered = filtered.filter(
          (v) => v.category && v.category.toLowerCase() === "sin-estrenar",
        );
        break;
      case "otros":
        filtered = filtered.filter(
          (v) => v.category && v.category.toLowerCase() === "otro",
        );
        break;
      default:
        break;
    }

    switch (sortBy) {
      case "price-asc":
        return [...filtered].sort((a, b) => {
          const priceA = parsePrice(a.price) || 0;
          const priceB = parsePrice(b.price) || 0;
          return priceA - priceB;
        });
      case "price-desc":
        return [...filtered].sort((a, b) => {
          const priceA = parsePrice(a.price) || 0;
          const priceB = parsePrice(b.price) || 0;
          return priceB - priceA;
        });
      case "m2-asc":
        return [...filtered].sort((a, b) => {
          const m2A = parsePrice(a.metros) || 0;
          const m2B = parsePrice(b.metros) || 0;
          return m2A - m2B;
        });
      case "m2-desc":
        return [...filtered].sort((a, b) => {
          const m2A = parsePrice(a.metros) || 0;
          const m2B = parsePrice(b.metros) || 0;
          return m2B - m2A;
        });
      default:
        return filtered;
    }
  };

  const filteredViviendas = getFilteredViviendas();

  if (loading) {
    return (
      <div className="min-h-screen bg-kehre-gradient-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-blue mx-auto mb-4"></div>
          <p className="text-primary-blue text-lg">{loadingText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kehre-gradient-light">
      <Banner
        title={bannerTitle}
        subtitle={bannerSubtitle}
        showCarousel={false}
        customImage="/banner/Fondo_LM.webp"
        height="medium"
      />

      {/* Filtros de categoria y ordenamiento */}
      <section className="px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Filtros por categoria */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-neutral-gray shadow-sm mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2 sm:gap-3 lg:justify-center">
              {[
                {
                  id: "todas",
                  label: todasLabel,
                  count: viviendas.length,
                  icon: Squares2X2Icon,
                },
                {
                  id: "destacadas",
                  label: destacadasLabel,
                  count: propiedadesDestacadas.length,
                  icon: StarIcon,
                },
                {
                  id: "alquileres",
                  label: alquileresLabel,
                  count: alquileres.length,
                  icon: KeyIcon,
                },
                {
                  id: "usadas",
                  label: usadasLabel,
                  count: viviendasUsadas.length,
                  shortLabel: usadasLabel,
                  icon: ArrowPathIcon,
                },
                {
                  id: "nuevas",
                  label: nuevasLabel,
                  count: sinEstrenar.length,
                  icon: SparklesIcon,
                },
                {
                  id: "otros",
                  label: otrosLabel,
                  count: otros.length,
                  icon: AdjustmentsHorizontalIcon,
                },
              ].map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={activeCategory === category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-3 sm:px-4 lg:px-5 py-2 sm:py-3 rounded-full font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base border ${
                      activeCategory === category.id
                        ? "bg-primary-blue text-white border-primary-blue"
                        : "bg-white text-neutral-muted border-neutral-gray hover-text-neutral-dark hover-bg-neutral-gray"
                    }`}
                  >
                    <span className="truncate inline-flex items-center gap-2">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline">{category.label}</span>
                      <span className="sm:hidden">
                        {category.shortLabel || category.label}
                      </span>
                    </span>
                    <span
                      className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0 ${
                        activeCategory === category.id
                          ? "bg-white/20 text-white"
                          : "bg-neutral-light text-neutral-muted"
                      }`}
                    >
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtro de ordenamiento */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-neutral-gray shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <label
                htmlFor="sort-select"
                className="text-neutral-muted font-medium text-sm sm:text-base"
              >
                {ordenarLabel}
              </label>
              <div className="relative w-full sm:w-auto">
                <select
                  id="sort-select"
                  name="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none px-4 py-2 pr-10 rounded-full border border-neutral-gray bg-white text-sm sm:text-base cursor-pointer transition-colors hover:bg-neutral-light hover:border-primary-blue hover:ring-2 hover:ring-primary-blue/30 hover:ring-offset-2 hover:ring-offset-white focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="none">{sinOrdenarLabel}</option>
                  <option value="price-asc">{precioMenorLabel}</option>
                  <option value="price-desc">{precioMayorLabel}</option>
                  <option value="m2-asc">{tamanoMenorLabel}</option>
                  <option value="m2-desc">{tamanoMayorLabel}</option>
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-muted" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <main id="propiedades-section" className="px-4 md:px-8 pb-12">
        {/* Contador de resultados */}
        <div className="mb-6 text-center max-w-7xl mx-auto">
          <p className="text-primary-blue text-lg">
            {filteredViviendas.length > 0
              ? `${seEncontraronText} ${filteredViviendas.length} ${propiedadesText}`
              : noSeEncontraronText}
          </p>
        </div>

        {/* Propiedades */}
        <div className="max-w-7xl mx-auto">
          {filteredViviendas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredViviendas.map((vivienda) => (
                <div key={vivienda.id} className="relative">
                  <ViviendaCard vivienda={vivienda} images={images} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-8 w-8 text-neutral-muted mx-auto mb-4" />
              <p className="text-lg text-neutral-muted mb-2">
                {noHayEnCategoriaText}
              </p>
            </div>
          )}
        </div>

        {/* Mensaje si no hay propiedades en total */}
        {viviendas.length === 0 && (
          <div className="text-center py-12">
            <HomeIcon className="h-8 w-8 text-neutral-muted mx-auto mb-4" />
            <p className="text-lg text-neutral-muted">{noHayPropiedadesText}</p>
          </div>
        )}
      </main>
    </div>
  );
}
