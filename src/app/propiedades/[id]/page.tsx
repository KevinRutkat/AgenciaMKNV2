import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase, Vivienda, ViviendaImage } from "@/lib/supabase";
import ViviendaDetailClient from "@/components/ViviendaDetailClient";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

const baseUrl = "https://www.agenciamkn.com";

const normalizeImageUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${normalized}`;
};

const toNumber = (value?: string | number | null) => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  const cleaned = value
    .replace(/\s+/g, "")
    .replace(/\u00A0/g, "")
    .replace(/[\u20AC$]/g, "");
  const lastDot = cleaned.lastIndexOf(".");
  const lastComma = cleaned.lastIndexOf(",");
  let normalized = cleaned;
  if (lastComma > lastDot) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    normalized = cleaned.replace(/,/g, "");
  } else {
    normalized = cleaned.replace(/,/g, "");
  }
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

// ⚠️ ACTUALIZADO: params es una Promise en versiones modernas de Next.js
type Props = {
  params: Promise<{ id: string }>;
};

// 🔹 Metadatos dinámicos por vivienda
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Esperamos a que se resuelvan los parámetros
  const { id } = await params;

  const { data } = await supabase
    .from("viviendas")
    .select("name, location, price, descripcion")
    .eq("id", id)
    .single<Vivienda>();

  const { data: imageData } = await supabase
    .from("vivienda_images")
    .select("url")
    .eq("vivienda_id", id)
    .order("inserted_at", { ascending: true })
    .limit(1);

  if (!data) {
    return {
      title: "Vivienda no encontrada | Agencia MKN",
      description:
        "La propiedad solicitada no existe o ya no está disponible en Agencia MKN",
    };
  }

  const title = `${data.name} en ${
    data.location ?? "Cabo de Palos"
  } | Agencia MKN`;

  const canonical = `/propiedades/${id}`;
  
  const baseDescription =
    data.descripcion?.replace(/\s+/g, " ").trim() ||
    `Propiedad en ${data.location ?? "Cabo de Palos"} gestionada por Agencia MKN.`;
  
  const description =
    baseDescription.length > 155
      ? `${baseDescription.slice(0, 152)}...`
      : baseDescription;

  const fallbackImage = "https://www.agenciamkn.com/LogoPNG.png";
  const ogImage = normalizeImageUrl(imageData?.[0]?.url) || fallbackImage;
  const ogImages = [
    {
      url: ogImage,
      width: 1200,
      height: 630,
      alt: data.name || "Agencia MKN",
    },
  ];

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${baseUrl}${canonical}`,
      siteName: "Agencia MKN",
      type: "article",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// 🔹 Server Component
export default async function ViviendaDetailPage({ params }: Props) {
  // Esperamos a los params
  const { id } = await params;

  const { data: vivienda, error } = await supabase
    .from("viviendas")
    .select("*")
    .eq("id", id)
    .single<Vivienda>();

  if (error || !vivienda) {
    notFound();
  }

  const { data: imagesRaw } = await supabase
    .from("vivienda_images")
    .select("*")
    .eq("vivienda_id", id)
    .order("inserted_at", { ascending: true });

  const images: ViviendaImage[] = imagesRaw || [];
  const imageUrls = images
    .map((img) => normalizeImageUrl(img.url))
    .filter((url): url is string => Boolean(url));

  const priceValue = toNumber(vivienda.price);
  const sizeValue = toNumber(vivienda.metros);
  const roomCount =
    typeof vivienda.habitaciones === "number" && vivienda.habitaciones > 0
      ? vivienda.habitaciones
      : undefined;
  const bathroomCount =
    typeof vivienda.bathroom === "number" && vivienda.bathroom > 0
      ? vivienda.bathroom
      : undefined;
  const floorCount =
    typeof vivienda.plantas === "number" && vivienda.plantas > 0
      ? vivienda.plantas
      : undefined;
  const floorSize = sizeValue
    ? { "@type": "QuantitativeValue", value: sizeValue, unitCode: "MTK" }
    : undefined;
  const geo =
    vivienda.lat && vivienda.lng
      ? {
          "@type": "GeoCoordinates",
          latitude: vivienda.lat,
          longitude: vivienda.lng,
        }
      : undefined;

  // 🔹 SEO: Datos Estructurados (JSON-LD) para Google Rich Results
  const postedDate =
    vivienda.inserted_at && !Number.isNaN(Date.parse(vivienda.inserted_at))
      ? new Date(vivienda.inserted_at).toISOString()
      : undefined;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: `${baseUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Propiedades",
        item: `${baseUrl}/propiedades`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: vivienda.name,
        item: `${baseUrl}/propiedades/${vivienda.id}`,
      },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/propiedades/${vivienda.id}`,
    },
    "name": vivienda.name,
    "description": vivienda.descripcion,
    "datePosted": postedDate,
    "category": vivienda.property_type,
    "numberOfRooms": roomCount,
    "numberOfBathroomsTotal": bathroomCount,
    "numberOfFloors": floorCount,
    "floorSize": floorSize,
    "geo": geo,
    "image": imageUrls,
    "url": `${baseUrl}/propiedades/${vivienda.id}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": vivienda.location,
      "addressRegion": "Murcia", 
      "addressCountry": "ES",
    },
    "offers": {
      "@type": "Offer",
      "price": priceValue ?? vivienda.price,
      "priceCurrency": "EUR",
      "availability": vivienda.is_sold
        ? "https://schema.org/Sold"
        : "https://schema.org/InStock",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-teal-50 to-teal-100 z-10">
      {/* Script invisible para Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Banner "Vendido" arriba si aplica */}
      {vivienda.is_sold && (
        <div className="bg-red-600 text-white text-center py-2">
          <span className="text-sm sm:text-base font-semibold inline-flex items-center gap-2">
            <CheckBadgeIcon className="h-4 w-4" />
            Esta propiedad está marcada como <strong>VENDIDA</strong>
          </span>
        </div>
      )}

      {/* Componente Cliente */}
      <ViviendaDetailClient vivienda={vivienda} images={images} />
    </div>
  );
}
