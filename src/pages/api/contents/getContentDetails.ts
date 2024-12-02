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

    return res.status(200).json(content);
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error);
    return res.status(500).json({ error: 'Erro ao buscar conteúdo.' });
  }
}
