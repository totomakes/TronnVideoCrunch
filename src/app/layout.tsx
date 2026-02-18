import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tronn Video Cruncher",
  description: "Mobile-first triple-panel video processor powered by FFmpeg.wasm",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tronn",
  },
  openGraph: {
    title: "Tronn Video Cruncher",
    description: "High-performance browser-side video processing",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
