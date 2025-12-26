import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Translation | Agencia MKN",
  robots: { index: false, follow: false },
  alternates: { canonical: "/test-translation" },
};

export default function TestTranslationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
