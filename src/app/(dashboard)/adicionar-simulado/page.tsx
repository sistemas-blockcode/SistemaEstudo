'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface Subject {
  id: string;
  nome: string;
}

export default function AdicionarSimuladoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    subjectId: '',
    perguntas: [
      { enunciado: '', alternativas: ['', '', '', ''], correta: '' },
    ],
    createdBy: '',
  });

  useEffect(() => {
    async function fetchUserAndSubjects() {
      try {
        const userResponse = await fetch('/api/users/getMe');
        if (!userResponse.ok) throw new Error('Erro ao buscar informações do usuário');
        const user = await userResponse.json();
        setForm((prev) => ({ ...prev, createdBy: user.id }));

        const subjectsResponse = await fetch('/api/subjects');
        if (!subjectsResponse.ok) throw new Error('Erro ao buscar matérias');
        const subjectsData: Subject[] = await subjectsResponse.json();
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    }
    fetchUserAndSubjects();
  }, [toast]);

  const handleAddQuestion = () => {
    setForm((prev) => ({
      ...prev,
      perguntas: [
        ...prev.perguntas,
        { enunciado: '', alternativas: ['', '', '', ''], correta: '' },
      ],
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    setForm((prev) => ({
      ...prev,
      perguntas: prev.perguntas.filter((_, i) => i !== index),
    }));
  };

  const handleFormSubmit = async () => {
    if (!form.titulo || !form.descricao || !form.createdBy) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const perguntasValidas = form.perguntas.every(
      (pergunta) =>
        pergunta.enunciado &&
        pergunta.alternativas.every((alt) => alt) &&
        pergunta.correta
    );

    if (!perguntasValidas) {
      toast({
        title: 'Erro',
        description: 'Certifique-se de que todas as perguntas estão completas.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/quizzes/addQuiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error('Erro ao criar o simulado');

      toast({
        title: 'Sucesso',
        description: 'Simulado criado com sucesso!',
        variant: 'success',
      });
      router.push('/simulados');
    } catch (error) {
      console.error('Erro ao criar simulado:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar o simulado. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Adicionar Simulado</h1>
      <input
        type="text"
        placeholder="Título"
        className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
        value={form.titulo}
        onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
      />
      <textarea
        placeholder="Descrição"
        className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
        rows={3}
        value={form.descricao}
        onChange={(e) => setForm((prev) => ({ ...prev, descricao: e.target.value }))}
      />

      <div
        className="p-4 border rounded-lg bg-white"
        style={{ maxHeight: '400px', overflowY: 'auto' }}
      >
        {form.perguntas.map((pergunta, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-2 mb-4">
            <input
              type="text"
              placeholder="Enunciado"
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={pergunta.enunciado}
              onChange={(e) =>
                setForm((prev) => {
                  const perguntas = [...prev.perguntas];
                  perguntas[index].enunciado = e.target.value;
                  return { ...prev, perguntas };
                })
              }
            />
            {pergunta.alternativas.map((alternativa, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
                className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
                value={alternativa}
                onChange={(e) =>
                  setForm((prev) => {
                    const perguntas = [...prev.perguntas];
                    perguntas[index].alternativas[i] = e.target.value;
                    return { ...prev, perguntas };
                  })
                }
              />
            ))}
            <input
              type="text"
              placeholder="Resposta Correta"
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={pergunta.correta}
              onChange={(e) =>
                setForm((prev) => {
                  const perguntas = [...prev.perguntas];
                  perguntas[index].correta = e.target.value;
                  return { ...prev, perguntas };
                })
              }
            />
            <button
              onClick={() => handleRemoveQuestion(index)}
              className="text-red-600 text-sm hover:underline"
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
      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={() => router.push('/simulados')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          onClick={handleFormSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Criar Simulado
        </button>
      </div>
    </div>
  );
}
