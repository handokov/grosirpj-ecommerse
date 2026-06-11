import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GrosirPJ - Pusat Grosir Baju Anak & Remaja Terpercaya",
  description:
    "GrosirPJ adalah pusat grosir baju anak dan remaja terpercaya di Indonesia. Beli grosir fashion bayi, balita, anak-anak, dan remaja dengan harga termurah. Kualitas terbaik, pengiriman cepat ke seluruh Indonesia.",
  keywords: [
    "grosir baju anak",
    "grosir fashion anak",
    "grosir baju remaja",
    "grosir baju bayi",
    "grosir baju balita",
    "baju anak grosir murah",
    "grosir pakaian anak",
    "supplier baju anak",
    "distributor baju anak",
    "grosir dress anak",
    "grosir kaos anak",
    "grosir gamis anak",
    "grosir sepatu anak",
    "toko grosir baju anak online",
    "pusat grosir fashion anak Indonesia",
    "GrosirPJ",
    "grosir baju anak tanah abang",
    "grosir baju anak murah meriah",
  ],
  authors: [{ name: "GrosirPJ" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "GrosirPJ - Pusat Grosir Baju Anak & Remaja Terpercaya",
    description:
      "Beli grosir baju anak dan remaja berkualitas dengan harga termurah. Fashion bayi, balita, anak-anak, remaja. Gratis ongkir & garansi 100%.",
    url: "https://grosirpj.com",
    siteName: "GrosirPJ",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "GrosirPJ - Grosir Baju Anak & Remaja Terpercaya",
    description:
      "Beli grosir fashion anak dan remaja berkualitas. Harga termurah, gratis ongkir, garansi 100%.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://grosirpj.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "GrosirPJ",
              url: "https://grosirpj.com",
              logo: "https://grosirpj.com/logo.svg",
              description:
                "Pusat grosir baju anak dan remaja terpercaya di Indonesia. Fashion bayi, balita, anak-anak, dan remaja dengan harga grosir termurah.",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Jl. Raya Grosir No. 123, Tanah Abang",
                addressLocality: "Jakarta Pusat",
                addressRegion: "DKI Jakarta",
                postalCode: "10230",
                addressCountry: "ID",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+62-812-3456-7890",
                contactType: "customer service",
                availableLanguage: ["Indonesian", "English"],
              },
              sameAs: [
                "https://facebook.com/grosirpj",
                "https://instagram.com/grosirpj",
                "https://youtube.com/grosirpj",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "GrosirPJ",
              url: "https://grosirpj.com",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://grosirpj.com/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
