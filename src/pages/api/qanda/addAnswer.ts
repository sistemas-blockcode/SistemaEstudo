import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { resposta, perguntaId, userId } = req.body;

    if (!resposta || !perguntaId || !userId) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
      const newAnswer = await prisma.resposta.create({
        data: {
          conteudo: resposta,
          perguntaId,
          autorId: userId,
        },
      });

      return res.status(201).json(newAnswer);
    } catch (error) {
      console.error('Erro ao adicionar resposta:', error);
      return res.status(500).json({ message: 'Erro ao adicionar resposta.' });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Método ${req.method} não permitido.`);
}
