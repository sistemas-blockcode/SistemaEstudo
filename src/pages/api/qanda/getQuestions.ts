import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const questions = await prisma.qandA.findMany({
        include: {
          user: { select: { nome: true } }, // Usuário que fez a pergunta
          subject: { select: { nome: true } }, // Matéria da pergunta
          respostas: { // Respostas da pergunta
            select: {
              id: true,
              conteudo: true,
              dataResposta: true,
              autor: { select: { nome: true } }, // Autor da resposta
            },
          },
        },
        orderBy: {
          dataPergunta: 'desc', // Ordenação por data
        },
      });

      return res.status(200).json(questions);
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error);
      return res.status(500).json({ message: 'Erro ao buscar perguntas.' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Método ${req.method} não permitido.`);
}
