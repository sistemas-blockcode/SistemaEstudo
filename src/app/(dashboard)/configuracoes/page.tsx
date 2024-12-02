'use client';
import { useState, useEffect } from 'react';
import { IconTrash, IconUserCancel, IconUserPlus } from '@tabler/icons-react';

interface User {
  id: string;
  nome: string;
  email: string;
  createdAt: string;
  tipo: string;
}

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [profile, setProfile] = useState<{ nome: string; email: string; tipo: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/users/getMe');
        if (!response.ok) throw new Error('Erro ao buscar perfil');
        const data = await response.json();
        setProfile({ nome: data.nome, email: data.email, tipo: data.tipo });
      } catch (error) {
        console.error('Erro ao carregar o perfil:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Erro ao buscar usuários');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    }
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string) => {
    try {
      const response = await fetch('/api/users/deleteUser', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir usuário');
      }

      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
    }
  };

  const handlePromoteUser = async (id: string) => {
    try {
      const response = await fetch('/api/users/promoteUser', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Erro ao promover usuário');
      }

      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, tipo: 'ADMIN' } : user
        )
      );
    } catch (error) {
      console.error('Erro ao promover usuário:', error);
    }
  };

  const handleDemoteUser = async (id: string) => {
    try {
      const response = await fetch('/api/users/demoteUser', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Erro ao rebaixar usuário');
      }

      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, tipo: 'ALUNO' } : user
        )
      );
    } catch (error) {
      console.error('Erro ao rebaixar usuário:', error);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-8 bg-gray-100 rounded-lg">
      <h1 className="text-2xl font-semibold text-gray-800">Configurações</h1>

      {/* Configurações do Perfil */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Configurações do Perfil</h2>
        <div className="grid gap-4">
          <input
            type="text"
            placeholder="Nome"
            value={profile?.nome || ''}
            onChange={(e) => setProfile((prev) => ({ ...prev!, nome: e.target.value }))}
            className="p-2 border border-gray-300 rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            value={profile?.email || ''}
            readOnly
            className="p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
          />
        </div>
        <button className="mt-4 text-xs px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition">
          Salvar Configurações
        </button>
      </div>

      {/* Gerenciamento do Sistema - Visível Apenas para ADMIN */}
      {profile?.tipo === 'ADMIN' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Gerenciamento do Sistema</h2>
          </div>

          <div className="overflow-x-auto border-[1.5px] rounded-2xl">
            <table className="min-w-full bg-white border-collapse border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-4 text-left text-gray-800 font-semibold">ID</th>
                  <th className="py-2 px-4 text-left text-gray-800 font-semibold">Nome</th>
                  <th className="py-2 px-4 text-left text-gray-800 font-semibold">Data de Criação</th>
                  <th className="py-2 px-4 text-left text-gray-800 font-semibold">Cargo</th>
                  <th className="py-2 px-4 text-left text-gray-800 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-gray-700">{index + 1}</td>
                    <td className="py-3 px-4 text-gray-700">{user.nome}</td>
                    <td className="py-3 px-4 text-gray-700">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 px-4 text-gray-700">{user.tipo}</td>
                    <td className="py-3 px-4 text-gray-700 flex items-center space-x-2">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <IconTrash size={18} />
                      </button>
                      {user.tipo === 'ALUNO' && (
                        <button
                          onClick={() => handlePromoteUser(user.id)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <IconUserPlus size={18} />
                        </button>
                      )}
                      {user.tipo === 'ADMIN' && (
                        <button
                          onClick={() => handleDemoteUser(user.id)}
                          className="text-orange-500 hover:text-orange-700"
                        >
                          <IconUserCancel size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
