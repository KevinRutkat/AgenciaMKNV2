import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase, Vivienda, ViviendaImage } from "@/lib/supabase";
import ViviendaDetailClient from "@/components/ViviendaDetailClient";

type Props = {
  params: { id: string };
};

// 🔹 Metadatos dinámicos por vivienda
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabase
    .from("viviendas")
    .select("name, location, price, descripcion")
    .eq("id", params.id)
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
    openGraph: {
      title,
      description,
      url: `https://agenciamkn.com/propiedades/${params.id}`,
      siteName: "Agencia MKN",
      type: "article",
    },
  };
}

// 🔹 Server Component: trae datos de Supabase y los pasa al cliente
export default async function ViviendaDetailPage({ params }: Props) {
  const { data: vivienda, error } = await supabase
    .from("viviendas")
    .select("*")
    .eq("id", params.id)
    .single<Vivienda>();

  if (error || !vivienda) {
    notFound();
  }

  const { data: imagesRaw } = await supabase
    .from("vivienda_images")
    .select("*")
    .eq("vivienda_id", params.id)
    .order("inserted_at", { ascending: true });

  const images: ViviendaImage[] = imagesRaw || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-teal-50 to-teal-100 z-10">
      {/* Banner "Vendido" arriba si aplica */}
      {vivienda.is_sold && (
        <div className="bg-red-600 text-white text-center py-2">
          <span className="text-sm sm:text-base font-semibold">
            🔴 Esta propiedad está marcada como <strong>VENDIDA</strong>
          </span>
        </div>
      )}

      {/* El resto del contenido lo sigue gestionando el componente cliente */}
      <ViviendaDetailClient vivienda={vivienda} images={images} />
    </div>
  );
}
