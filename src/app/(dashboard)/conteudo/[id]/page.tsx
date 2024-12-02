'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IconArrowLeft } from '@tabler/icons-react';


export default function ConteudoPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = params?.id as string;

  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch(`/api/contents/getContentDetails?id=${contentId}`);
        if (!response.ok) throw new Error('Erro ao buscar os detalhes do conteúdo.');
        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error('Erro ao buscar o conteúdo:', error);
      }
    }

    if (contentId) fetchContent();
  }, [contentId]);

  if (!content) return <p>Carregando...</p>;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
    <div className='flex '>
        <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-blue-500 hover:underline"
        >
            <IconArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">{content.titulo}</h1>
      </div>
      <p className="text-gray-600">{content.descricao}</p>

      {content.tipo === 'VIDEO' && (
        <div className="mt-4">
          <video controls className="w-full max-w-4xl rounded-lg shadow-md">
            <source src={content.url} type="video/mp4" />
            Seu navegador não suporta a reprodução de vídeo.
          </video>
        </div>
      )}

      {content.tipo === 'PDF' && (
        <div className="mt-4">
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Visualizar PDF
          </a>
        </div>
      )}

      {content.tipo === 'LINK' && (
        <div className="mt-4">
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Acessar o Link
          </a>
        </div>
      )}
    </div>
  );
}
