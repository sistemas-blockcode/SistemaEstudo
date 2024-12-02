'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IconPlus, IconArrowLeft, IconVideo, IconFileText } from '@tabler/icons-react';

export default function FolderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params?.folderId as string;

  const [folder, setFolder] = useState<any>(null);
  const [profile, setProfile] = useState<{ nome: string; email: string; tipo: string } | null>(null);

  useEffect(() => {
    async function fetchFolder() {
      try {
        const response = await fetch(`/api/folders/getFolderDetails?id=${folderId}`);
        if (!response.ok) throw new Error('Erro ao buscar detalhes da pasta.');
        const data = await response.json();
        setFolder(data);
      } catch (error) {
        console.error('Erro ao buscar detalhes da pasta:', error);
      }
    }

    async function fetchProfile() {
      try {
        const response = await fetch('/api/users/getMe');
        if (!response.ok) throw new Error('Erro ao buscar informações do usuário.');
        const userProfile = await response.json();
        setProfile({ nome: userProfile.nome, email: userProfile.email, tipo: userProfile.tipo });
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
      }
    }

    if (folderId) fetchFolder();
    fetchProfile();
  }, [folderId]);

  const handleDeleteFolder = async () => {
    try {
      const response = await fetch(`/api/folders/deleteFolder?id=${folderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir a pasta.');

      alert('Pasta excluída com sucesso!');
      router.push('/folders');
    } catch (error) {
      console.error('Erro ao excluir pasta:', error);
    }
  };

  if (!folder) return <p>Carregando...</p>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        {/* Botão Voltar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 transition"
          >
            <IconArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">Pasta: {folder.name}</h1>
        </div>

        {/* Botão Novo Conteúdo */}
        {profile?.tipo === 'ADMIN' && (
          <button
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition"
            onClick={() => router.push(`/novo-conteudo/${folderId}`)}
          >
            <IconPlus size={15} />
            Novo Conteúdo
          </button>
        )}
      </div>

      {/* Lista de Conteúdos */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {folder.contents.length === 0 ? (
          <p className="text-gray-500">Nenhum material nesta pasta ainda.</p>
        ) : (
          folder.contents.map((content: any) => (
            <div
              key={content.id}
              onClick={() => router.push(`/conteudo/${content.id}`)}
              className="group relative flex flex-col justify-between p-4 bg-white border border-gray-300 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
            >
              {/* Ícone do tipo de conteúdo */}
              <div className="flex items-center gap-3">
                {content.tipo === 'VIDEO' ? (
                  <IconVideo size={36} className="text-blue-500" />
                ) : (
                  <IconFileText size={36} className="text-green-500" />
                )}
                <h2 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600">
                  {content.titulo}
                </h2>
              </div>
              <p className="text-sm text-gray-600 mt-2">{content.descricao}</p>
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-50 rounded-lg transition"></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
