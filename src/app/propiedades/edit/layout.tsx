import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editar propiedad | Agencia MKN",
  robots: { index: false, follow: false },
  alternates: { canonical: "/propiedades/edit" },
};

export default function PropiedadesEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
