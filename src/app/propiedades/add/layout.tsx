import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agregar propiedad | Agencia MKN",
  robots: { index: false, follow: false },
  alternates: { canonical: "/propiedades/add" },
};

export default function PropiedadesAddLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
