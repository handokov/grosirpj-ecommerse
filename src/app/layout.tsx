import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import SiteLayout from "@/components/layout/SiteLayout";
import PWARegistrar from "@/components/pwa/PWARegistrar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GrosirPJ - Pusat Grosir Baju Anak & Baby Kids Terpercaya",
  description:
    "GrosirPJ adalah pusat grosir baju anak dan baby kids terpercaya di Indonesia. Beli grosir fashion bayi, balita, dan anak-anak dengan harga termurah. Kualitas terbaik, pengiriman cepat ke seluruh Indonesia.",
  keywords: [
    "grosir baju anak",
    "grosir fashion anak",
    "grosir baju bayi",
    "grosir baju balita",
    "grosir baju baby kids",
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
    icon: [
      { url: "/logo-sm.png", sizes: "32x32" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon-180x180.png",
  },
  openGraph: {
    title: "GrosirPJ - Pusat Grosir Baju Anak & Baby Kids Terpercaya",
    description:
      "Beli grosir baju anak dan baby kids berkualitas dengan harga termurah. Fashion bayi, balita, anak-anak. COD Jakarta & garansi 100%.",
    url: "https://grosirpj.com",
    siteName: "GrosirPJ",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "GrosirPJ - Grosir Baju Anak & Baby Kids Terpercaya",
    description:
      "Beli grosir fashion anak dan baby kids berkualitas. Harga termurah, COD Jakarta, garansi 100%.",
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
  manifest: "/manifest.json",
  applicationName: "GrosirPJ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GrosirPJ",
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
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#065f46" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GrosirPJ" />
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
                "Pusat grosir baju anak dan baby kids terpercaya di Indonesia. Fashion bayi, balita, dan anak-anak dengan harga grosir termurah.",
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
                target: "https://grosirpj.com/cari?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SiteLayout>{children}</SiteLayout>
        <PWARegistrar />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
