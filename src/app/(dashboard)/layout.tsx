'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false); // Flag para controlar o redirecionamento

  useEffect(() => {
    // Evitar que o fetch seja chamado novamente após o redirecionamento
    if (redirecting) {
      console.log("Redirecionamento em andamento. Ignorando fetchUser...");
      return;
    }

    async function fetchUser() {
      console.log("Iniciando fetchUser...");
      try {
        const response = await fetch('/api/users/getMeNew', {
          method: 'GET',
          credentials: 'include', // Inclui cookies na requisição
          headers: {
            'Cache-Control': 'no-cache', // Certifica-se de que o navegador não usa cache
          },
        });

        console.log("Resposta da API:", response);

        if (!response.ok) {
          console.error("Erro na resposta da API:", response.status, response.statusText);
          if (response.status === 401) {
            console.log("Redirecionando para /login...");
            router.push('/login');
          }
          throw new Error(`Erro na resposta da API: ${response.status}`);
        }

        const data = await response.json();
        console.log("Dados retornados da API:", data);

        if (!data.selectedSemesterId) {
          console.log("Semestre não selecionado, redirecionando para /select-semester...");
          setRedirecting(true); // Ativamos a flag para impedir loops
          router.push('/select-semester');
          return; // Interrompe o fluxo após o redirecionamento
        }

        console.log("Usuário autenticado e semestre selecionado:", data);
        setUser(data);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      } finally {
        console.log("Finalizando fetchUser...");
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [router, redirecting]); // Adicionado `redirecting` como dependência

  if (redirecting || isLoading) {
    console.log("Redirecionando ou carregando dados...");
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p>{redirecting ? "Redirecionando..." : "Carregando..."}</p>
      </div>
    );
  }

  if (!user) {
    console.error("Usuário não carregado ou redirecionado.");
    return null; // Retorna nada se o usuário ainda não foi carregado
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-100 p-6">
        {children}
        <Toaster />
      </div>
    </div>
  );
}
