"use client";

import SemesterSelectionModal from "@/components/SemesterSelectionModal";
import { useEffect, useState } from "react";

// Defina o tipo para o usuário
interface User {
  id: string;
  selectedSemesterId: string | null;
}

export default function SemesterSelectionWrapper({
  user,
  children,
}: {
  user: User; // Adiciona o tipo para o usuário
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(!user.selectedSemesterId);

  useEffect(() => {
    // Se o usuário já tiver um semestre selecionado, não exiba o modal novamente
    if (user.selectedSemesterId) {
      setLoading(false);
    }
  }, [user.selectedSemesterId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <SemesterSelectionModal user={user} />
      {children}
    </>
  );
}
