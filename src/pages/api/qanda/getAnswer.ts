import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { perguntaId } = req.query;

    if (!perguntaId || typeof perguntaId !== 'string') {
      return res.status(400).json({ message: 'ID da pergunta é obrigatório.' });
    }

    try {
      const questionWithAnswers = await prisma.qandA.findUnique({
        where: { id: perguntaId },
        include: {
          user: { select: { nome: true } }, // Usuário que fez a pergunta
          subject: { select: { nome: true } }, // Matéria da pergunta
          respostas: { // Respostas associadas
            select: {
              id: true,
              conteudo: true,
              dataResposta: true,
              autor: { select: { nome: true } }, // Autor da resposta
            },
          },
        },
      });

      if (!questionWithAnswers) {
        return res.status(404).json({ message: 'Pergunta não encontrada.' });
      }

      return res.status(200).json(questionWithAnswers);
    } catch (error) {
      console.error('Erro ao buscar respostas:', error);
      return res.status(500).json({ message: 'Erro ao buscar respostas.' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Método ${req.method} não permitido.`);
}
