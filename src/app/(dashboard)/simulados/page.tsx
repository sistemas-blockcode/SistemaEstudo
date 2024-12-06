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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSimulado, setSelectedSimulado] = useState<{ id: string; titulo: string } | null>(
    null
  );
  const [questions, setQuestions] = useState<
    { id: string; enunciado: string; alternativas: string[]; respostaCorreta: string }[]
  >([]);
  const [newTitulo, setNewTitulo] = useState('');
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

  const handleOpenEditModal = async (simuladoId: string) => {
    try {
      const response = await fetch(`/api/quizzes/getQuizzes?id=${simuladoId}`);
      if (!response.ok) throw new Error('Erro ao buscar perguntas do simulado');
      const data = await response.json();

      setSelectedSimulado({ id: data.id, titulo: data.titulo });
      setQuestions(data.questions);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
    }
  };

  const handleSaveQuestions = async () => {
    try {
      const response = await fetch('/api/quizzes/editQuiz', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedSimulado?.id, questions }),
      });

      if (!response.ok) throw new Error('Erro ao salvar perguntas');
      setIsModalOpen(false);
      setSelectedSimulado(null);
      setQuestions([]);
    } catch (error) {
      console.error('Erro ao salvar perguntas:', error);
    }
  };

  const handleChangeQuestion = (index: number, field: string, value: string) => {
    setQuestions((prev) => {
      const updatedQuestions = [...prev];
      if (field === 'enunciado') {
        updatedQuestions[index].enunciado = value;
      } else if (field === 'respostaCorreta') {
        updatedQuestions[index].respostaCorreta = value;
      }
      return updatedQuestions;
    });
  };

  const handleChangeAlternative = (questionIndex: number, alternativeIndex: number, value: string) => {
    setQuestions((prev) => {
      const updatedQuestions = [...prev];
      updatedQuestions[questionIndex].alternativas[alternativeIndex] = value;
      return updatedQuestions;
    });
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
                onClick={() => router.push(`/simulados/${simulado.id}`)}
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
                          toggleDropdown(simulado.id);
                        }}
                      >
                        Excluir
                      </button>
                      <button
                        className="block w-full px-4 py-2 text-sm text-orange-400 hover:bg-gray-100 text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(simulado.id);
                        }}
                      >
                        Editar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-xl font-semibold mb-4">Editar Perguntas</h2>
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-2">
                  <input
                    type="text"
                    value={question.enunciado}
                    placeholder="Enunciado"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    onChange={(e) => handleChangeQuestion(index, 'enunciado', e.target.value)}
                  />
                  {question.alternativas.map((alt, i) => (
                    <input
                      key={i}
                      type="text"
                      value={alt}
                      placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      onChange={(e) => handleChangeAlternative(index, i, e.target.value)}
                    />
                  ))}
                  <input
                    type="text"
                    value={question.respostaCorreta}
                    placeholder="Resposta Correta"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    onChange={(e) => handleChangeQuestion(index, 'respostaCorreta', e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveQuestions}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
