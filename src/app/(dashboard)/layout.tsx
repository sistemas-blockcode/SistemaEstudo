'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/sidebar';
import { Toaster } from '@/components/ui/toaster';
import SemesterSelectionWrapper from '@/components/SemesterSelectionWrapper';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null); // Estado para armazenar o usuário
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar o carregamento

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/users/getMe');
        if (!response.ok) throw new Error('Erro ao buscar usuário.');
        const data = await response.json();
        setUser(data); // Define os dados do usuário
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      } finally {
        setIsLoading(false); // Finaliza o estado de carregamento
      }
    }

    fetchUser();
  }, []);

  // Exibe uma tela de carregamento enquanto os dados do usuário estão sendo buscados
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p>Carregando...</p>
      </div>
    );
  }

  // Caso não consiga carregar o usuário, exibe uma mensagem de erro
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p>Erro ao carregar os dados do usuário.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-100 p-6">
        <SemesterSelectionWrapper user={user}>
          {children}
        </SemesterSelectionWrapper>

        {/* Notificações */}
        <Toaster />
      </div>
    </div>
  );
}
