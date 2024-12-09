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
  const [selectedSimulado, setSelectedSimulado] = useState<{
    id: string;
    titulo: string;
    descricao: string;
  } | null>(null);
  const [questions, setQuestions] = useState<
    { enunciado: string; alternativas: string[]; respostaCorreta: string }[]
  >([]);
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

  const handleDeleteQuiz = async (simuladoId: string) => {
    if (!window.confirm('Tem certeza de que deseja excluir este simulado?')) {
      return;
    }

    try {
      const response = await fetch(`/api/quizzes/deleteQuiz?id=${simuladoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir o simulado');
      }

      setSimulados((prev) => prev.filter((simulado) => simulado.id !== simuladoId));
      alert('Simulado excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir o simulado:', error);
      alert('Erro ao excluir o simulado. Tente novamente mais tarde.');
    }
  };

  const handleOpenEditModal = async (simuladoId: string) => {
    try {
      const response = await fetch(`/api/quizzes/getQuizzes?id=${simuladoId}`);
      if (!response.ok) throw new Error('Erro ao buscar perguntas do simulado');
      const data = await response.json();

      setSelectedSimulado({ id: data.id, titulo: data.titulo, descricao: data.descricao });
      setQuestions(data.questions);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
    }
  };

  const handleSaveSimulado = async () => {
    if (!selectedSimulado?.titulo || !selectedSimulado.descricao) {
      alert('Preencha o título e a descrição do simulado.');
      return;
    }

    const perguntasValidas = questions.every(
      (question) =>
        question.enunciado &&
        question.alternativas.every((alt) => alt) &&
        question.respostaCorreta
    );

    if (!perguntasValidas) {
      alert('Certifique-se de que todas as perguntas estão completas.');
      return;
    }

    try {
      const response = await fetch('/api/quizzes/editQuiz', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...selectedSimulado, questions }),
      });

      if (!response.ok) throw new Error('Erro ao salvar simulado');
      setIsModalOpen(false);
      setSelectedSimulado(null);
      setQuestions([]);
      alert('Simulado atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar simulado:', error);
      alert('Erro ao salvar simulado. Tente novamente.');
    }
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { enunciado: '', alternativas: ['', '', '', ''], respostaCorreta: '' },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
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
                          handleDeleteQuiz(simulado.id);
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
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl h-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6">Editar Simulado</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Título e Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input
                  type="text"
                  value={selectedSimulado?.titulo || ''}
                  placeholder="Título"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-lg"
                  onChange={(e) =>
                    setSelectedSimulado((prev) =>
                      prev ? { ...prev, titulo: e.target.value } : prev
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  value={selectedSimulado?.descricao || ''}
                  placeholder="Descrição"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-lg"
                  rows={4}
                  onChange={(e) =>
                    setSelectedSimulado((prev) =>
                      prev ? { ...prev, descricao: e.target.value } : prev
                    )
                  }
                />
              </div>
            </div>

            {/* Perguntas */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Perguntas</h3>
              {questions.map((question, index) => (
                <div key={index} className="p-4 border rounded-lg bg-white mb-4">
                  <label className="block text-sm font-medium text-gray-700">Enunciado</label>
                  <input
                    type="text"
                    value={question.enunciado}
                    placeholder="Enunciado"
                    className="w-full p-2 mt-1 border border-gray-300 rounded-lg mb-4"
                    onChange={(e) => handleChangeQuestion(index, 'enunciado', e.target.value)}
                  />
                  {question.alternativas.map((alt, i) => (
                    <div key={i} className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Alternativa {String.fromCharCode(65 + i)}
                      </label>
                      <input
                        type="text"
                        value={alt}
                        placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
                        className="w-full p-2 mt-1 border border-gray-300 rounded-lg"
                        onChange={(e) => handleChangeAlternative(index, i, e.target.value)}
                      />
                    </div>
                  ))}
                  <label className="block text-sm font-medium text-gray-700 mt-4">Resposta Correta</label>
                  <input
                    type="text"
                    value={question.respostaCorreta}
                    placeholder="Resposta Correta"
                    className="w-full p-2 mt-1 border border-gray-300 rounded-lg"
                    onChange={(e) => handleChangeQuestion(index, 'respostaCorreta', e.target.value)}
                  />
                  <button
                    onClick={() => handleRemoveQuestion(index)}
                    className="text-red-600 text-sm mt-2 hover:underline"
                  >
                    Remover Pergunta
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddQuestion}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Adicionar Pergunta
              </button>
            </div>

            {/* Ações */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSimulado}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
