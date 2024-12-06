import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ error: 'Método não permitido. Use PUT.' });
  }

  const { id, titulo, questions } = req.body;

  if (!id || (!titulo && !questions)) {
    return res.status(400).json({ error: 'ID e pelo menos um dos campos (título ou perguntas) são obrigatórios.' });
  }

  try {
    // Atualizar título do simulado, se enviado
    if (titulo) {
      await prisma.quiz.update({
        where: { id },
        data: { titulo },
      });
    }

    // Atualizar perguntas, se enviadas
    if (questions && Array.isArray(questions)) {
      for (const question of questions) {
        const { id: questionId, enunciado, alternativas, respostaCorreta } = question;

        if (!questionId || !enunciado || !alternativas || !respostaCorreta) {
          return res.status(400).json({ error: 'Dados incompletos para atualizar perguntas.' });
        }

        await prisma.quizQuestion.update({
          where: { id: questionId },
          data: {
            enunciado,
            alternativas,
            respostaCorreta,
          },
        });
      }
    }

    return res.status(200).json({ success: true, message: 'Simulado atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar o simulado:', error);
    return res.status(500).json({ error: 'Erro ao atualizar o simulado.' });
  }
}
