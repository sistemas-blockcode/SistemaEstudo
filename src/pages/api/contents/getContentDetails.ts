import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Método não permitido. Use GET.' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID do conteúdo é obrigatório.' });
  }

  try {
    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      return res.status(404).json({ error: 'Conteúdo não encontrado.' });
    }

    // Retornar o conteúdo como uma resposta de arquivo
    const buffer = Buffer.from(content.url!, 'base64'); // Decodifica o conteúdo em base64 para binário

    // Determina o tipo de conteúdo com base no tipo armazenado no banco de dados
    let contentType = 'application/octet-stream'; // Valor padrão
    if (content.tipo === 'PDF') contentType = 'application/pdf';
    if (content.tipo === 'VIDEO') contentType = 'video/mp4';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${content.titulo}"`); // Abre o arquivo no navegador
    res.status(200).send(buffer);
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error);
    return res.status(500).json({ error: 'Erro ao buscar conteúdo.' });
  }
}
