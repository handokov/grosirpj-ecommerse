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
  title: "GrosirPJ - Pusat Grosir Terpercaya | Beli Grosir Online Murah",
  description:
    "GrosirPJ adalah platform grosir online terpercaya di Indonesia. Beli produk grosir berkualitas dengan harga terbaik. Gratis ongkir, garansi 100%, dan pengiriman ke seluruh Indonesia.",
  keywords: [
    "grosir",
    "grosir online",
    "beli grosir",
    "grosir murah",
    "grosir terpercaya",
    "wholesale Indonesia",
    "grosir elektronik",
    "grosir fashion",
    "grosir makanan",
    "toko grosir online",
    "pusat grosir",
    "supplier grosir",
    "distributor grosir",
    "GrosirPJ",
  ],
  authors: [{ name: "GrosirPJ" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "GrosirPJ - Pusat Grosir Terpercaya",
    description:
      "Beli produk grosir berkualitas dengan harga terbaik. Gratis ongkir, garansi 100%, pengiriman ke seluruh Indonesia.",
    url: "https://grosirpj.com",
    siteName: "GrosirPJ",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "GrosirPJ - Pusat Grosir Terpercaya",
    description:
      "Beli produk grosir berkualitas dengan harga terbaik. Gratis ongkir & garansi 100%.",
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
                "Platform grosir online terpercaya di Indonesia dengan harga terbaik dan kualitas terjamin.",
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
