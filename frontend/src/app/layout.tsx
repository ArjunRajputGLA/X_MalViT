import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "X-MalViT | Autonomous Cyber Threat Defense Center",
  description: "Explainable Vision Transformer for Static Malware Family Classification and Grad-CAM PE Attribution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080c14] text-slate-100 antialiased selection:bg-sky-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
