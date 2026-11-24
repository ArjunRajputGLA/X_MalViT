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
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
