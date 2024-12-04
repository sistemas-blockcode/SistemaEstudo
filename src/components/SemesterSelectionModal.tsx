'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SemesterSelectionModalProps {
  user: { id: string; selectedSemesterId: string | null };
}

export default function SemesterSelectionModal({
  user,
}: SemesterSelectionModalProps) {
  const [isOpen, setIsOpen] = useState(!user.selectedSemesterId); // Abre o modal apenas se o usuário não tiver semestre selecionado
  const [selectedSemester, setSelectedSemester] = useState('');
  const [semesters, setSemesters] = useState<{ id: string; numero: number }[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user.selectedSemesterId) {
      setIsOpen(false); // Fecha o modal se já tiver semestre selecionado
    } else {
      fetchSemesters();
    }
  }, [user.selectedSemesterId]);

  const fetchSemesters = async () => {
    try {
      const response = await fetch('/api/semesters/getSemesters');
      if (!response.ok) throw new Error('Erro ao buscar semestres.');
      const data = await response.json();
      setSemesters(data);
    } catch (error) {
      console.error('Erro ao buscar semestres:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSemester) {
      alert("Selecione um semestre antes de continuar.");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const response = await fetch("/api/users/setSelectedSemester", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": user.id, // Enviando o ID do usuário
        },
        body: JSON.stringify({ semesterId: selectedSemester }),
      });
  
      if (!response.ok) throw new Error("Erro ao atualizar semestre.");
  
      setIsOpen(false); // Fecha o modal após seleção
      router.refresh(); // Atualiza os dados da página
    } catch (error) {
      console.error("Erro ao atualizar semestre:", error);
      alert("Erro ao salvar o semestre.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4">Selecione seu Semestre</h2>
        <div className="space-y-4">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="" disabled>
              Escolha seu semestre
            </option>
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                Semestre {semester.numero}
              </option>
            ))}
          </select>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full p-2 bg-blue-500 text-white rounded-lg ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {isSubmitting ? 'Salvando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
