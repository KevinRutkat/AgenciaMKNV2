import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase, Vivienda, ViviendaImage } from "@/lib/supabase";
import ViviendaDetailClient from "@/components/ViviendaDetailClient";

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

  if (!data) {
    return {
      title: "Vivienda no encontrada | Agencia MKN",
      description:
        "La propiedad solicitada no existe o ya no está disponible en Agencia MKN.",
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
      ? `${baseDescription.slice(0, 152)}…`
      : baseDescription;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `https://www.agenciamkn.com${canonical}`,
      siteName: "Agencia MKN",
      type: "article",
      images: [
        {
          url: "https://www.agenciamkn.com/LogoPNG.png",
          width: 1200,
          height: 630,
          alt: "Agencia MKN",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://www.agenciamkn.com/LogoPNG.png"],
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

  // 🔹 SEO: Datos Estructurados (JSON-LD) para Google Rich Results
  const postedDate =
    vivienda.inserted_at && !Number.isNaN(Date.parse(vivienda.inserted_at))
      ? new Date(vivienda.inserted_at).toISOString()
      : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.agenciamkn.com/propiedades/${vivienda.id}`,
    },
    "name": vivienda.name,
    "description": vivienda.descripcion,
    "datePosted": postedDate,
    "image": images.length > 0 ? images.map((img) => img.url) : [],
    "url": `https://www.agenciamkn.com/propiedades/${vivienda.id}`,
// Asumiendo que tienes created_at
    "address": {
      "@type": "PostalAddress",
      "addressLocality": vivienda.location,
      "addressRegion": "Murcia", 
      "addressCountry": "ES",
    },
    "offers": {
      "@type": "Offer",
      "price": vivienda.price,
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

      {/* Banner "Vendido" arriba si aplica */}
      {vivienda.is_sold && (
        <div className="bg-red-600 text-white text-center py-2">
          <span className="text-sm sm:text-base font-semibold">
            🔴 Esta propiedad está marcada como <strong>VENDIDA</strong>
          </span>
        </div>
      )}

      {/* Componente Cliente */}
      <ViviendaDetailClient vivienda={vivienda} images={images} />
    </div>
  );
}