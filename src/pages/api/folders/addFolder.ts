import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nome da pasta é obrigatório.' });
    }

    try {
      const folderExists = await prisma.folder.findUnique({ where: { name } });
      if (folderExists) {
        return res.status(409).json({ message: 'Já existe uma pasta com este nome.' });
      }

      const newFolder = await prisma.folder.create({
        data: {
          name,
        },
      });

      return res.status(201).json(newFolder);
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      return res.status(500).json({ message: 'Erro ao criar pasta.' });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Método ${req.method} não permitido.`);
}
