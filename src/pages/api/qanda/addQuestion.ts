import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { pergunta, userId, subjectId } = req.body;
    if (!pergunta || !userId) {
      return res.status(400).json({ message: 'Pergunta e usuário são obrigatórios.' });
    }

    try {
      const newQuestion = await prisma.qandA.create({
        data: {
          pergunta,
          userId,
          subjectId: subjectId || null,
        },
        include: {
          user: { select: { nome: true } },
          subject: { select: { nome: true } },
        },
      });
      return res.status(201).json(newQuestion);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao adicionar pergunta.', error });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Método ${req.method} não permitido.`);
}
