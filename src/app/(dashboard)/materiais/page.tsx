'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconFolder, IconPlus, IconDotsVertical } from '@tabler/icons-react';
import { useToast } from '@/hooks/use-toast';

interface FolderProps {
  id: string;
  name: string;
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
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchFolders() {
      try {
        const response = await fetch('/api/folders/getFolders', {
          headers: { 'user-id': localStorage.getItem('userId') || '' },
        });

        if (!response.ok) throw new Error('Erro ao buscar as pastas.');
        const data = await response.json();
        setFolders(data);
      } catch (error) {
        console.error('Erro ao buscar pastas:', error);
      }
    }

    async function fetchProfile() {
      try {
        const response = await fetch('/api/users/getMe');
        if (!response.ok) throw new Error('Erro ao buscar informações do usuário.');
        const profile = await response.json();
        setIsAdmin(profile.tipo === 'ADMIN');
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
      }
    }

    fetchFolders();
    fetchProfile();
  }, []);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome da pasta não pode estar vazio.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/folders/addFolder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: folderName }),
      });

      if (!response.ok) throw new Error('Erro ao criar a pasta.');

      const newFolder = await response.json();
      setFolders([...folders, newFolder]);
      setFolderName('');
      setIsCreateModalOpen(false);
      toast({
        title: 'Sucesso',
        description: 'A pasta foi criada com sucesso.',
        variant: 'success',
      });
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao criar a pasta.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const response = await fetch(`/api/folders/deleteFolder?id=${folderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir a pasta.');

      setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
      toast({
        title: 'Sucesso',
        description: 'A pasta foi excluída com sucesso.',
        variant: 'success',
      });
    } catch (error) {
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

    try {
      const response = await fetch(`/api/folders/updateFolder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingFolderId, name: folderName }),
      });

      if (!response.ok) throw new Error('Erro ao editar a pasta.');

      setFolders((prev) =>
        prev.map((folder) => (folder.id === editingFolderId ? { ...folder, name: folderName } : folder))
      );
      setFolderName('');
      setEditingFolderId(null);
      setIsEditModalOpen(false);
      toast({
        title: 'Sucesso',
        description: 'A pasta foi editada com sucesso.',
        variant: 'success',
      });
    } catch (error) {
      console.error('Erro ao editar pasta:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao editar a pasta.',
        variant: 'destructive',
      });
    }
  };

  const handleFolderClick = (folderId: string) => {
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
            onClick={() => handleFolderClick(folder.id)}
            onDelete={() => handleDeleteFolder(folder.id)}
            onEdit={() => {
              setEditingFolderId(folder.id);
              setFolderName(folder.name);
              setIsEditModalOpen(true);
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
              onChange={(e) => setFolderName(e.target.value)}
            />
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                onClick={() => setIsCreateModalOpen(false)}
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
              onChange={(e) => setFolderName(e.target.value)}
            />
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                onClick={() => setIsEditModalOpen(false)}
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
