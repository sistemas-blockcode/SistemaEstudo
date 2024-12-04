"use client";

import SemesterSelectionModal from "@/components/SemesterSelectionModal";
import { useEffect, useState } from "react";

export default function SemesterSelectionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/users/getMe");
        if (!response.ok) throw new Error("Erro ao buscar usuário.");
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

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
