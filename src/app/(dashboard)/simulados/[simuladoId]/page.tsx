'use client';
import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { IconCheck, IconX } from "@tabler/icons-react";

interface Question {
  enunciado: string;
  alternativas: string[];
  respostaCorreta: string;
}

export default function SimuladoDetalhes({ params }: { params: { simuladoId: string } }) {
  const router = useRouter();
  const [simulado, setSimulado] = useState<{
    titulo: string;
    descricao: string;
    questions: Question[];
  } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [isResultScreen, setIsResultScreen] = useState(false);

  const currentQuestion = simulado?.questions[currentQuestionIndex];

  useEffect(() => {
    async function fetchSimulado() {
      try {
        const response = await fetch(`/api/quizzes/getQuizzes?id=${params.simuladoId}`);
        if (!response.ok) throw new Error("Erro ao buscar detalhes do simulado");
        const data = await response.json();
        setSimulado(data);
      } catch (error) {
        console.error("Erro ao carregar simulado:", error);
      }
    }

    fetchSimulado();
  }, [params.simuladoId]);

  const handleConfirm = () => {
    if (!currentQuestion || selectedAnswer === null) return;

    const isAnswerCorrect = selectedAnswer === currentQuestion.respostaCorreta;
    setIsCorrect(isAnswerCorrect);
    setScore((prev) => ({
      correct: prev.correct + (isAnswerCorrect ? 1 : 0),
      incorrect: prev.incorrect + (!isAnswerCorrect ? 1 : 0),
    }));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnswer(null);

    if (currentQuestionIndex < (simulado?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsResultScreen(true);
    }
  };

  const handleFinishSimulado = () => {
    router.push("/simulados");
  };

  if (!simulado) {
    return <p>Carregando...</p>;
  }

  if (isResultScreen) {
    const totalQuestions = score.correct + score.incorrect;
    const correctPercentage = ((score.correct / totalQuestions) * 100).toFixed(2);
    const incorrectPercentage = ((score.incorrect / totalQuestions) * 100).toFixed(2);

    return (
      <div className="p-6 bg-gray-100 rounded-lg max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Resultados do Simulado</h1>
        <p className="text-lg text-gray-700 mb-4">
          Você concluiu o simulado com os seguintes resultados:
        </p>
        <div className="flex justify-center gap-6 mb-6">
          <div className="p-4 bg-green-100 text-green-600 rounded-lg shadow">
            <p className="text-2xl font-bold">{score.correct}</p>
            <p className="text-sm font-medium">Acertos</p>
            <p className="text-sm font-medium">{correctPercentage}%</p>
          </div>
          <div className="p-4 bg-red-100 text-red-600 rounded-lg shadow">
            <p className="text-2xl font-bold">{score.incorrect}</p>
            <p className="text-sm font-medium">Erros</p>
            <p className="text-sm font-medium">{incorrectPercentage}%</p>
          </div>
        </div>
        <button
          onClick={handleFinishSimulado}
          className="px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
        >
          Fechar Simulado
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 rounded-lg max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">{simulado.titulo}</h1>
      <p className="text-gray-600 mb-4">{simulado.descricao}</p>

      {currentQuestion && (
        <div className="p-6 bg-white rounded-lg shadow-md border space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 font-medium text-sm">Questão {currentQuestionIndex + 1}</p>
          </div>
          <p className="font-semibold text-lg text-gray-800">{currentQuestion.enunciado}</p>
          <ul className="space-y-2">
            {currentQuestion.alternativas.map((alt, i) => (
              <li
                key={i}
                className={`p-2 border rounded-lg cursor-pointer transition ${
                  selectedAnswer === alt
                    ? "bg-blue-100 border-blue-500"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => setSelectedAnswer(alt)}
              >
                <span className="font-bold">{String.fromCharCode(97 + i)})</span> {alt}
              </li>
            ))}
          </ul>
          <button
            onClick={handleConfirm}
            disabled={selectedAnswer === null}
            className={`mt-4 w-full p-3 rounded-lg text-white font-semibold ${
              selectedAnswer === null
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Confirmar
          </button>
        </div>
      )}

      {/* Modal de Resultado */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} className="relative z-50">
        <div className="fixed inset-0 bg-black bg-opacity-50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
            <Dialog.Title className="flex items-center gap-2">
              {isCorrect ? (
                <div className="flex items-center gap-2 text-green-600">
                  <IconCheck size={24} />
                  Resposta Correta!
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <IconX size={24} />
                  Resposta Errada!
                </div>
              )}
            </Dialog.Title>
            <div className="mt-4">
              {currentQuestion && (
                <>
                  <p className="text-gray-700">
                    A alternativa correta é:{" "}
                    <span className="font-bold text-green-600">{currentQuestion.respostaCorreta}</span>
                  </p>
                  {!isCorrect && (
                    <p className="text-gray-700">
                      Sua escolha: <span className="font-bold text-red-600">{selectedAnswer}</span>
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                Fechar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
