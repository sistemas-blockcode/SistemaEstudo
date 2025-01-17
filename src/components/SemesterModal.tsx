'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SemesterModalProps {
  semesters: { id: string; numero: number; descricao?: string | null }[]; // Ajustado aqui
}

export default function SemesterModal({ semesters }: SemesterModalProps) {
  const router = useRouter();
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedSemester) return alert('Selecione um semestre!');
    setLoading(true);
  
    try {
      // Fazendo a requisição para salvar o semestre
      const response = await fetch('/api/users/selectSemester', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semesterId: selectedSemester }),
        credentials: 'include', // Certifique-se de incluir isso
      });
  
      if (!response.ok) throw new Error('Erro ao salvar o semestre.');
  
      // Redireciona para o dashboard
      router.push('/home');
    } catch (error) {
      alert('Erro ao salvar o semestre. Tente novamente!');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">Selecione seu Período</h2>
        <div className="space-y-2">
          {semesters.map((semester) => (
            <label key={semester.id} className="flex items-center space-x-2">
              <input
                type="radio"
                value={semester.id}
                checked={selectedSemester === semester.id}
                onChange={() => setSelectedSemester(semester.id)}
              />
              <span>
                {`Período ${semester.numero} ${
                  semester.descricao ? `- ${semester.descricao}` : ''
                }`}
              </span>
            </label>
          ))}
        </div>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Confirmar'}
        </button>
      </div>
    </div>
  );
}
