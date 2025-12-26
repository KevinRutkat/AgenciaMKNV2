import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Translation Example | Agencia MKN",
  robots: { index: false, follow: false },
  alternates: { canonical: "/translation-example" },
};

export default function TranslationExampleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
