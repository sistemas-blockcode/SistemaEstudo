'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  IconPlus,
  IconArrowLeft,
  IconVideo,
  IconFileText,
  IconDotsVertical,
  IconFileTypePpt,
  IconFileTypePdf,
  IconFileWord,
} from '@tabler/icons-react';

export default function FolderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params?.folderId as string;

  const [folder, setFolder] = useState<any>(null);
  const [profile, setProfile] = useState<{ nome: string; email: string; tipo: string } | null>(null);
  const [dropdownsOpen, setDropdownsOpen] = useState<{ [key: string]: boolean }>({});

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

  const handleDeleteContent = async (contentId: string) => {
    try {
      const response = await fetch(`/api/contents/deleteContent?id=${contentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir conteúdo.');
      }

      alert('Conteúdo excluído com sucesso!');
      setFolder((prev: any) => ({
        ...prev,
        contents: prev.contents.filter((content: any) => content.id !== contentId),
      }));
    } catch (error) {
      console.error('Erro ao excluir conteúdo:', error);
      alert('Erro ao excluir conteúdo.');
    }
  };

  const toggleDropdown = (contentId: string) => {
    setDropdownsOpen((prev) => ({
      ...prev,
      [contentId]: !prev[contentId],
    }));
  };

  if (!folder) return <p>Carregando...</p>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/materiais')}
            className="text-gray-600 hover:text-gray-800 transition"
          >
            <IconArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">Pasta: {folder.name}</h1>
        </div>

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

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {folder.contents.length === 0 ? (
          <p className="text-gray-500">Nenhum material nesta pasta ainda.</p>
        ) : (
          folder.contents.map((content: any) => (
            <div
              key={content.id}
              className="group relative flex flex-col justify-between p-4 bg-white border border-gray-300 rounded-lg shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => window.open(`/api/contents/getContentDetails?id=${content.id}`, '_blank')}
                >
                  {content.tipo === 'VIDEO' ? (
                    <IconVideo size={36} className="text-blue-500" />
                  ) : content.tipo === 'PDF' ? (
                    <IconFileTypePdf size={36} className="text-red-500" />
                  ) : content.tipo === 'DOCX' ? (
                    <IconFileWord size={36} className="text-blue-400" />
                  ) : content.tipo === 'PPTX' ? (
                    <IconFileTypePpt size={36} className="text-orange-500" />
                  ) : (
                    <IconFileText size={36} className="text-green-500" />
                  )}
                  <h2 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600">
                    {content.titulo}
                  </h2>
                </div>

                {profile?.tipo === 'ADMIN' && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(content.id);
                      }}
                      className="text-gray-600 hover:text-gray-800 transition"
                    >
                      <IconDotsVertical size={20} />
                    </button>
                    {dropdownsOpen[content.id] && (
                      <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg w-28 z-10">
                        <button
                          className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteContent(content.id);
                            toggleDropdown(content.id);
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">{content.descricao}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
