'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconPlus, IconDotsVertical } from '@tabler/icons-react';

export default function SimuladosPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [simulados, setSimulados] = useState<
    { id: string; titulo: string; descricao: string }[]
  >([]);
  const [dropdownsOpen, setDropdownsOpen] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await fetch('/api/users/getMe');
        if (!response.ok) throw new Error('Erro ao buscar perfil do usuário');
        const data = await response.json();
        setIsAdmin(data.tipo === 'ADMIN');
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    }

    async function fetchSimulados() {
      try {
        const response = await fetch('/api/quizzes/getQuizzes');
        if (!response.ok) throw new Error('Erro ao buscar simulados');
        const data = await response.json();
        setSimulados(data);
      } catch (error) {
        console.error('Erro ao buscar simulados:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
    fetchSimulados();
  }, []);

  const handleDeleteSimulado = async (simuladoId: string) => {
    try {
      const response = await fetch(`/api/quizzes/deleteQuiz?id=${simuladoId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao excluir simulado');
      setSimulados((prev) => prev.filter((simulado) => simulado.id !== simuladoId));
    } catch (error) {
      console.error('Erro ao excluir simulado:', error);
    }
  };

  const toggleDropdown = (simuladoId: string) => {
    setDropdownsOpen((prev) => ({
      ...prev,
      [simuladoId]: !prev[simuladoId],
    }));
  };

  return (
    <div className="p-6 space-y-8 bg-gray-100 rounded-lg">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Simulados</h1>
        {isAdmin && (
          <button
            onClick={() => router.push('/adicionar-simulado')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition"
          >
            <IconPlus size={15} />
            Novo Simulado
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando simulados...</p>
      ) : simulados.length === 0 ? (
        <p className="text-gray-500 col-span-full">Nenhum simulado disponível.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {simulados.map((simulado) => (
            <div
              key={simulado.id}
              className="relative bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold text-gray-800">{simulado.titulo}</h3>
              <p className="text-gray-600 mt-2">{simulado.descricao}</p>
              <button
                onClick={() => router.push(`/simulados/${simulado.id}`)} // Navega para a rota dinâmica
                className="mt-4 w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
              >
                Acessar Simulado
              </button>

              {isAdmin && (
                <div className="absolute top-3 right-3">
                  <button
                    className="text-gray-600 hover:text-gray-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown(simulado.id);
                    }}
                  >
                    <IconDotsVertical size={20} />
                  </button>
                  {dropdownsOpen[simulado.id] && (
                    <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg w-28">
                      <button
                        className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSimulado(simulado.id);
                          toggleDropdown(simulado.id);
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
