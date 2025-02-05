// /pages/materiais.tsx

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconFolder, IconPlus, IconDotsVertical } from '@tabler/icons-react';
import { useToast } from '@/hooks/use-toast';

interface FolderProps {
  id: string;
  name: string;
  contents: any[]; // Ajuste o tipo conforme sua necessidade
  onClick: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isAdmin: boolean;
}

function Folder({ id, name, onClick, onDelete, onEdit, isAdmin }: FolderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="relative">
      <div
        className="flex flex-col items-center justify-center w-72 h-40 bg-white rounded-lg shadow-md cursor-pointer hover:bg-gray-200 transition"
        onClick={onClick}
        data-folder-id={id}
      >
        <IconFolder size={50} className="text-blue-500" />
        <span className="mt-2 text-sm font-semibold text-gray-700">{name}</span>
      </div>
      {isAdmin && (
        <div className="absolute top-2 right-6">
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen((prev) => !prev);
            }}
          >
            <IconDotsVertical size={20} />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-1 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg w-28">
              <button
                className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                Excluir
              </button>
              <button
                className="block w-full px-4 py-2 text-sm text-orange-600 hover:bg-gray-100 text-left"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                Editar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MaterialsPage() {
  const [folders, setFolders] = useState<{ id: string; name: string; contents: any[] }[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchFolders() {
      console.log('Iniciando fetchFolders...');
      try {
        const response = await fetch('/api/folders/getFolders', {
          method: 'GET',
          credentials: 'include', // Inclui cookies na requisição
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        console.log(`Resposta da API (status: ${response.status}):`, response);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erro ao buscar as pastas:', errorData);
          toast({
            title: 'Erro',
            description: `Erro ao buscar as pastas: ${errorData.error || 'Desconhecido'}`,
            variant: 'destructive',
          });
          return;
        }

        const data = await response.json();
        console.log('Dados recebidos da API:', data);
        setFolders(data);
      } catch (error: any) {
        console.error('Erro ao buscar pastas:', error);
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao buscar as pastas.',
          variant: 'destructive',
        });
      }
    }

    async function fetchProfile() {
      console.log('Iniciando fetchProfile...');
      try {
        const response = await fetch('/api/users/getMeNew', {
          method: 'GET',
          credentials: 'include',
        });

        console.log(`Resposta da API (status: ${response.status}):`, response);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erro ao buscar informações do usuário:', errorData);
          toast({
            title: 'Erro',
            description: `Erro ao buscar informações do usuário: ${errorData.error || 'Desconhecido'}`,
            variant: 'destructive',
          });
          return;
        }

        const profile = await response.json();
        console.log('Perfil do usuário recebido:', profile);
        setIsAdmin(profile.tipo === 'ADMIN');
      } catch (error: any) {
        console.error('Erro ao buscar perfil do usuário:', error);
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao buscar o perfil do usuário.',
          variant: 'destructive',
        });
      }
    }

    fetchFolders();
    fetchProfile();
  }, [toast]);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome da pasta não pode estar vazio.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Criando nova pasta:', folderName);
    try {
      const response = await fetch('/api/folders/addFolder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: folderName }),
        credentials: 'include', // Inclui cookies na requisição
      });

      console.log(`Resposta da API ao criar pasta (status: ${response.status}):`, response);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao criar a pasta:', errorData);
        toast({
          title: 'Erro',
          description: `Erro ao criar a pasta: ${errorData.error || 'Desconhecido'}`,
          variant: 'destructive',
        });
        return;
      }

      const newFolder = await response.json();
      console.log('Nova pasta criada:', newFolder);
      setFolders([...folders, newFolder]);
      setFolderName('');
      setIsCreateModalOpen(false);
      toast({
        title: 'Sucesso',
        description: 'A pasta foi criada com sucesso.',
        variant: 'success',
      });
    } catch (error: any) {
      console.error('Erro ao criar pasta:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao criar a pasta.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    console.log(`Excluindo pasta com ID: ${folderId}`);
    try {
      const response = await fetch(`/api/folders/deleteFolder?id=${folderId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      console.log(`Resposta da API ao excluir pasta (status: ${response.status}):`, response);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao excluir a pasta:', errorData);
        toast({
          title: 'Erro',
          description: `Erro ao excluir a pasta: ${errorData.error || 'Desconhecido'}`,
          variant: 'destructive',
        });
        return;
      }

      setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
      console.log(`Pasta com ID ${folderId} excluída com sucesso.`);
      toast({
        title: 'Sucesso',
        description: 'A pasta foi excluída com sucesso.',
        variant: 'success',
      });
    } catch (error: any) {
      console.error('Erro ao excluir pasta:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir a pasta.',
        variant: 'destructive',
      });
    }
  };

  const handleEditFolder = async () => {
    if (!folderName.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome da pasta não pode estar vazio.',
        variant: 'destructive',
      });
      return;
    }

    console.log(`Editando pasta com ID: ${editingFolderId}, Novo nome: ${folderName}`);
    try {
      const response = await fetch(`/api/folders/updateFolder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingFolderId, name: folderName }),
        credentials: 'include',
      });

      console.log(`Resposta da API ao editar pasta (status: ${response.status}):`, response);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao editar a pasta:', errorData);
        toast({
          title: 'Erro',
          description: `Erro ao editar a pasta: ${errorData.error || 'Desconhecido'}`,
          variant: 'destructive',
        });
        return;
      }

      const updatedFolder = await response.json();
      console.log('Pasta atualizada:', updatedFolder);
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === editingFolderId ? { ...folder, name: folderName } : folder
        )
      );
      setFolderName('');
      setEditingFolderId(null);
      setIsEditModalOpen(false);
      toast({
        title: 'Sucesso',
        description: 'A pasta foi editada com sucesso.',
        variant: 'success',
      });
    } catch (error: any) {
      console.error('Erro ao editar pasta:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao editar a pasta.',
        variant: 'destructive',
      });
    }
  };

  const handleFolderClick = (folderId: string) => {
    console.log(`Navegando para a pasta com ID: ${folderId}`);
    router.push(`/materiais/${folderId}`);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Materiais</h1>
        {isAdmin && (
          <div className="flex gap-4">
            <button
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition"
              onClick={() => {
                setFolderName('');
                setIsCreateModalOpen(true);
                console.log('Abrindo modal para criar nova pasta.');
              }}
            >
              <IconPlus size={15} />
              Nova Pasta
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 items-center justify-center md:grid-cols-3 gap-y-5 lg:gap-x-4">
        {folders.map((folder) => (
          <Folder
            key={folder.id}
            id={folder.id}
            name={folder.name}
            contents={folder.contents}
            onClick={() => handleFolderClick(folder.id)}
            onDelete={() => handleDeleteFolder(folder.id)}
            onEdit={() => {
              setEditingFolderId(folder.id);
              setFolderName(folder.name);
              setIsEditModalOpen(true);
              console.log(`Abrindo modal para editar pasta com ID: ${folder.id}`);
            }}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {/* Modal para criar pasta */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-xl font-semibold mb-4">Criar Nova Pasta</h2>
            <input
              type="text"
              placeholder="Nome da Pasta"
              className="p-2 border border-gray-300 rounded-lg w-full mb-4"
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                console.log(`Nome da nova pasta alterado: ${e.target.value}`);
              }}
            />
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  console.log('Fechando modal de criação de pasta.');
                }}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                onClick={handleCreateFolder}
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar pasta */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-xl font-semibold mb-4">Editar Nome da Pasta</h2>
            <input
              type="text"
              placeholder="Novo Nome da Pasta"
              className="p-2 border border-gray-300 rounded-lg w-full mb-4"
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                console.log(`Nome da pasta sendo editada alterado: ${e.target.value}`);
              }}
            />
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                onClick={() => {
                  setIsEditModalOpen(false);
                  console.log('Fechando modal de edição de pasta.');
                }}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                onClick={handleEditFolder}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
