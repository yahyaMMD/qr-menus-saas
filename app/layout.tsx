import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/context";

const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://qrmenus.example.com";

export const metadata: Metadata = {
  title: {
    default: "QR Menus | Digital menu platform for modern restaurants",
    template: "%s | QR Menus",
  },
  description: "Create, customize, and share digital QR menus with analytics, multi-language support, and easy updates.",
  keywords: [
    "QR menu",
    "digital menu",
    "restaurant menu app",
    "contactless menu",
    "qr code menu",
    "menu analytics",
  ],
  applicationName: "QR Menus",
  authors: [{ name: "QR Menus Team" }],
  creator: "QR Menus",
  publisher: "QR Menus",
  metadataBase: new URL(appBaseUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "QR Menus | Digital menu platform for modern restaurants",
    description: "Design and deploy beautiful digital menus with QR codes, analytics, and multilingual support.",
    url: appBaseUrl,
    siteName: "QR Menus",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/assets/hero.jpg",
        width: 1200,
        height: 630,
        alt: "QR Menus digital menu platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Menus | Digital menu platform",
    description: "Create and manage digital QR menus with analytics and multilingual support.",
    images: ["/assets/hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
