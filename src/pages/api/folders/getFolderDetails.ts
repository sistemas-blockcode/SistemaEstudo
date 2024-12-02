import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'O ID da pasta é obrigatório.' });
    }

    try {
      const folder = await prisma.folder.findUnique({
        where: { id: String(id) },
        include: { contents: true },
      });

      if (!folder) {
        return res.status(404).json({ message: 'Pasta não encontrada.' });
      }

      return res.status(200).json({ ...folder, contents: folder.contents || [] });
    } catch (error) {
      console.error('Erro ao buscar detalhes da pasta:', error);
      return res.status(500).json({ message: 'Erro ao buscar detalhes da pasta.' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Método ${req.method} não permitido.`);
}
