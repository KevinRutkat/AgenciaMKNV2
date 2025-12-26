import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sesion | Agencia MKN",
  robots: { index: false, follow: false },
  alternates: { canonical: "/session" },
};

export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
