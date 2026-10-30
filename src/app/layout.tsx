import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

/* =========================================================
   MOKU FONT CONFIGURATION
========================================================= */

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

/* =========================================================
   MOKU APPLICATION METADATA
========================================================= */

export const metadata: Metadata = {
  title: {
    default: "MOKU | Monitoring Operasional Kunjungan Unit",
    template: "%s | MOKU",
  },

  description:
    "MOKU adalah aplikasi monitoring operasional untuk mengelola kunjungan, aktivitas, dan pemantauan unit mesin secara terintegrasi.",

  applicationName: "MOKU",

  keywords: [
    "MOKU",
    "Machine Visit Monitoring",
    "Monitoring Operasional",
    "Kunjungan Mesin",
    "Equipment Monitoring",
    "Visit Management",
  ],

  authors: [
    {
      name: "MOKU",
    },
  ],

  creator: "MOKU",

  publisher: "MOKU",

  robots: {
    index: false,
    follow: false,
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MOKU",
  },

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

/* =========================================================
   VIEWPORT CONFIGURATION
========================================================= */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
  themeColor: "#7C0041",
};

/* =========================================================
   ROOT APPLICATION LAYOUT
========================================================= */

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html
      lang="id"
      className={inter.variable}
      suppressHydrationWarning
    >
      <body>
        {children}
      </body>
    </html>
  );
}
