import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Replace Geist fonts with Inter which is more stable
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quiz Web App",
  description: "Interactive quiz application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
