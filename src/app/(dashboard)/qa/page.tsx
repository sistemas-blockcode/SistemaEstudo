'use client';
import { useState, useEffect } from 'react';
import { IconX, IconTrash } from '@tabler/icons-react';
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  subject: string;
  semester: string;
  pergunta: string;
  dataPergunta: string;
  respostas: Response[];
  user: { nome: string };
}

interface Response {
  id: string;
  autor: { nome: string };
  conteudo: string;
}

export default function QAPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState({ subject: '', semester: '', pergunta: '' });
  const [newResponse, setNewResponse] = useState('');
  const [filter, setFilter] = useState({ subject: '', semester: '' });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await fetch('/api/users/getMe');
        if (!response.ok) throw new Error('Erro ao buscar perfil do usuário.');
        const data = await response.json();
        setUserId(data.id);
        setIsAdmin(data.tipo === 'ADMIN');
      } catch {
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar o perfil do usuário.",
          variant: "destructive",
        });
      }
    }

    async function fetchQuestions() {
      try {
        const response = await fetch('/api/qanda/getQuestions');
        if (!response.ok) throw new Error('Erro ao buscar perguntas.');
        const data = await response.json();

        const formattedData = data.map((q: Question) => ({
          ...q,
          respostas: Array.isArray(q.respostas) ? q.respostas : [],
        }));

        setQuestions(formattedData);
      } catch {
        toast({
          title: "Erro ao carregar perguntas",
          description: "Não foi possível carregar as perguntas.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
    fetchQuestions();
  }, []);

  const handleSelectQuestion = (question: Question) => {
    setSelectedQuestion(question || null);
  };

  const handleDeleteQuestion = async (perguntaId: string) => {
    try {
      const response = await fetch('/api/qanda/deleteQuestion', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perguntaId, userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao excluir a pergunta.');
      }

      setQuestions((prev) => prev.filter((q) => q.id !== perguntaId));
      toast({
        title: "Pergunta excluída",
        description: "A pergunta foi excluída com sucesso.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir pergunta",
        description: "Ocorreu um erro ao tentar excluir a pergunta.",
        variant: "destructive",
      });
    }
  };

  const handleQuestionSubmit = async () => {
    if (!userId) {
      toast({
        title: "Erro ao postar pergunta",
        description: "Usuário não identificado. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    if (!newQuestion.semester || !newQuestion.pergunta) {
      toast({
        title: "Campos obrigatórios ausentes",
        description: "Todos os campos devem ser preenchidos.",
        variant: "destructive",
      });
      return;
    }

    const payload = { ...newQuestion, userId };

    try {
      const response = await fetch('/api/qanda/addQuestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error();

      const createdQuestion = await response.json();
      setQuestions([createdQuestion, ...questions]);
      setNewQuestion({ subject: '', semester: '', pergunta: '' });
      toast({
        title: "Pergunta postada",
        description: "Sua pergunta foi postada com sucesso!",
        variant: "success",
      });
    } catch {
      toast({
        title: "Erro ao postar pergunta",
        description: "Ocorreu um erro ao tentar postar sua pergunta.",
        variant: "destructive",
      });
    }
  };

  const handleResponseSubmit = async () => {
    if (!selectedQuestion || !newResponse.trim()) {
      toast({
        title: "Erro ao postar resposta",
        description: "É necessário selecionar uma pergunta e digitar uma resposta.",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Erro ao postar resposta",
        description: "Usuário não identificado. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      resposta: newResponse,
      perguntaId: selectedQuestion.id,
      userId,
    };

    try {
      const response = await fetch('/api/qanda/addAnswer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error();

      const createdResponse = await response.json();

      setSelectedQuestion((prev) =>
        prev
          ? {
              ...prev,
              respostas: [
                ...(prev.respostas || []),
                { id: createdResponse.id, autor: { nome: 'Você' }, conteudo: newResponse },
              ],
            }
          : prev
      );

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === selectedQuestion?.id
            ? {
                ...q,
                respostas: [
                  ...(q.respostas || []),
                  { id: createdResponse.id, autor: { nome: 'Você' }, conteudo: newResponse },
                ],
              }
            : q
        )
      );

      setNewResponse('');
      toast({
        title: "Resposta postada",
        description: "Sua resposta foi postada com sucesso!",
        variant: "success",
      });
    } catch {
      toast({
        title: "Erro ao postar resposta",
        description: "Ocorreu um erro ao tentar postar sua resposta.",
        variant: "destructive",
      });
    }
  };

  const filteredQuestions = questions.filter(
    (q) =>
      (filter.subject === '' || q.subject === filter.subject) &&
      (filter.semester === '' || q.semester === filter.semester)
  );

  return (
    <div className="p-6 space-y-8 bg-gray-100 rounded-lg">
      <h1 className="text-2xl font-semibold text-gray-800">Perguntas e Respostas (Q&A)</h1>
      <div className="bg-white p-4 rounded-lg shadow-md" style={{ maxHeight: "400px", overflowY: "scroll" }}>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Perguntas</h2>
        {loading ? (
          <p>Carregando perguntas...</p>
        ) : filteredQuestions.length === 0 ? (
          <p className="text-gray-500">Nenhuma pergunta encontrada.</p>
        ) : (
          filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="p-3 hover:bg-gray-200 rounded-lg transition flex justify-between items-center"
            >
              <div onClick={() => handleSelectQuestion(question)} className="cursor-pointer">
                <p className="font-semibold text-gray-800">{question.pergunta}</p>
                <p className="text-sm text-gray-500">
                  {question.respostas?.length || 0}{' '}
                  {question.respostas?.length === 1 ? 'resposta' : 'respostas'}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="text-red-600 hover:text-red-800"
                  aria-label="Excluir"
                >
                  <IconTrash size={20} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {selectedQuestion && (
        <div className="bg-white p-4 rounded-lg shadow-md mt-4 relative">
          <button
            onClick={() => setSelectedQuestion(null)}
            className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
            aria-label="Fechar"
          >
            <IconX size={20} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">{selectedQuestion.pergunta}</h2>
          <div className="space-y-3 mb-4">
            {selectedQuestion.respostas?.map((response) => (
              <div key={response.id} className="p-3 bg-gray-100 rounded-lg">
                <p className="font-semibold text-gray-800">{response.autor?.nome || 'Anônimo'}</p>
                <p className="text-gray-700">{response.conteudo}</p>
              </div>
            ))}
          </div>
          <textarea
            placeholder="Escreva sua resposta..."
            className="p-2 w-full border border-gray-300 rounded-lg mb-4"
            rows={3}
            value={newResponse}
            onChange={(e) => setNewResponse(e.target.value)}
          />
          <button
            onClick={handleResponseSubmit}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
          >
            Responder
          </button>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Poste uma Nova Pergunta</h2>
        <div className="grid gap-4">
          <input
            type="text"
            placeholder="Matéria"
            className="p-2 border border-gray-300 rounded-lg"
            value={newQuestion.subject}
            onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
          />
          <input
            type="text"
            placeholder="Semestre"
            className="p-2 border border-gray-300 rounded-lg"
            value={newQuestion.semester}
            onChange={(e) => setNewQuestion({ ...newQuestion, semester: e.target.value })}
          />
          <textarea
            placeholder="Pergunta"
            className="p-2 border border-gray-300 rounded-lg"
            rows={4}
            value={newQuestion.pergunta}
            onChange={(e) => setNewQuestion({ ...newQuestion, pergunta: e.target.value })}
          />
          <button
            onClick={handleQuestionSubmit}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
          >
            Postar Pergunta
          </button>
        </div>
      </div>
    </div>
  );
}
