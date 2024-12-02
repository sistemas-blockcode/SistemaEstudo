'use client';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';

export default function NovoConteudoPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = params?.folderId;

  const [nomeConteudo, setNomeConteudo] = useState('');
  const [tipoArquivo, setTipoArquivo] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmar = async () => {
    if (!nomeConteudo.trim() || !tipoArquivo.trim() || !arquivo) {
      alert('Por favor, preencha todos os campos e selecione um arquivo.');
      return;
    }

    if (!folderId) {
      alert('ID da pasta não encontrado.');
      return;
    }

    const formData = new FormData();
    formData.append('nomeConteudo', nomeConteudo);
    formData.append('tipoArquivo', tipoArquivo);
    formData.append('arquivo', arquivo);
    formData.append('folderId', Array.isArray(folderId) ? folderId[0] : folderId || ''); 

    setIsLoading(true);
    try {
      const response = await fetch('/api/contents/addContent', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao criar conteúdo.');
      }

      const data = await response.json();
      alert(`Conteúdo criado com sucesso! ID: ${data.id}`);
      router.push(`/materiais/${folderId}`);
    } catch (error) {
      console.error('Erro ao criar conteúdo:', error);
      alert('Ocorreu um erro ao criar o conteúdo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelar = () => {
    router.push(`/materiais/${folderId}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArquivo(e.target.files[0]);
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800">Novo Conteúdo</h1>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="nomeConteudo" className="block text-sm font-medium text-gray-700">
            Nome do Conteúdo
          </label>
          <input
            type="text"
            id="nomeConteudo"
            value={nomeConteudo}
            onChange={(e) => setNomeConteudo(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Digite o nome do conteúdo"
          />
        </div>

        <div>
          <label htmlFor="tipoArquivo" className="block text-sm font-medium text-gray-700">
            Tipo de Arquivo
          </label>
          <select
            id="tipoArquivo"
            value={tipoArquivo}
            onChange={(e) => setTipoArquivo(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>
              Selecione o tipo de arquivo
            </option>
            <option value="PDF">Livro</option>
            <option value="VIDEO">Vídeo</option>
            <option value="LINK">Slide</option>
          </select>
        </div>

        <div>
          <label htmlFor="arquivo" className="block text-sm font-medium text-gray-700 mb-2">
            Selecione um Arquivo
          </label>
          <div className="relative">
            <label
              htmlFor="arquivo"
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg cursor-pointer hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              Escolher Arquivo
            </label>
            <input
              type="file"
              id="arquivo"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          {arquivo && (
            <p className="text-sm text-gray-600 mt-2">
              Arquivo selecionado: <span className="font-semibold">{arquivo.name}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-4 justify-end">
          <button
            type="button"
            onClick={handleCancelar}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Enviando...' : 'Confirmar'}
          </button>
        </div>
      </form>
    </div>
  );
}
