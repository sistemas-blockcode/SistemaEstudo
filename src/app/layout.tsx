import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Poppins } from "next/font/google"; // Importando a fonte

const poppins = Poppins({
  subsets: ["latin"], // Define os subsets da fonte (ex.: latin, latin-ext)
  weight: ["400", "500", "600", "700"], // Escolha os pesos necessários
  display: "swap", // Usa o comportamento swap para melhorar a performance
});

export const metadata: Metadata = {
  title: "Estudos e Simulados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className={poppins.className}> {/* Adiciona a classe da fonte no HTML */}
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
