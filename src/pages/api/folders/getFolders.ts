import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const folders = await prisma.folder.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(folders);
    } catch (error) {
      console.error('Erro ao listar pastas:', error);
      return res.status(500).json({ message: 'Erro ao listar pastas.' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Método ${req.method} não permitido.`);
}
