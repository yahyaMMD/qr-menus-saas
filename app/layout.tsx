import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/context";
import { ReactQueryProvider } from "@/lib/react-query/provider";

const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://qresto.com";

export const metadata: Metadata = {
  title: {
    default: "QResto | Digital Menu Platform for Modern Restaurants",
    template: "%s | QResto",
  },
  description: "Create, customize, and share digital QResto with analytics, multi-language support, and easy updates. The best solution for contactless dining.",
  keywords: [
    "QR menu",
    "QResto",
    "QR Resto",
    "digital menu",
    "restaurant menu app",
    "contactless menu",
    "qr code menu",
    "menu analytics",
    "SaaS for restaurants",
    "multilingual menu",
  ],
  applicationName: "QResto",
  authors: [{ name: "QResto Team" }],
  creator: "QResto",
  publisher: "QResto",
  metadataBase: new URL(appBaseUrl),
  alternates: {
    canonical: "./",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "QResto | Digital Menu Platform for Modern Restaurants",
    description: "Design and deploy beautiful digital menus with QR codes, analytics, and multilingual support.",
    url: appBaseUrl,
    siteName: "QResto",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/assets/hero.jpg",
        width: 1200,
        height: 630,
        alt: "QResto Digital Menu Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QResto | Digital Menu Platform",
    description: "Create and manage digital QResto with analytics and multilingual support.",
    images: ["/assets/hero.jpg"],
    creator: "@qresto",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <ReactQueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
