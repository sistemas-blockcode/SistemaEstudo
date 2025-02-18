import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { perguntaId, userId } = req.body;

    if (!perguntaId || !userId) {
      return res.status(400).json({ message: 'ID da pergunta e ID do usuário são obrigatórios.' });
    }

    try {
      const question = await prisma.qandA.findFirst({
        where: { id: perguntaId, userId },
      });

      if (!question) {
        return res.status(403).json({ message: 'Usuário não autorizado para excluir esta resposta.' });
      }

      await prisma.qandA.update({
        where: { id: perguntaId },
        data: { resposta: null, dataResposta: null },
      });

      return res.status(200).json({ message: 'Resposta excluída com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir resposta:', error);
      return res.status(500).json({ message: 'Erro ao excluir resposta.' });
    }
  }

  res.setHeader('Allow', ['DELETE']);
  return res.status(405).end(`Método ${req.method} não permitido.`);
}
