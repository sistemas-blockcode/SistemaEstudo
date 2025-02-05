// /src/pages/api/qanda/addQuestion.ts

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  const { pergunta, subjectId } = req.body;

  if (!pergunta) {
    return res.status(400).json({ message: 'Pergunta é obrigatória.' });
  }

  // Autenticação do Usuário
  const authToken = req.cookies.authToken;
  if (!authToken) {
    return res.status(401).json({ error: "Usuário não autenticado. Token ausente." });
  }

  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { selectedSemester: true },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    if (!user.selectedSemesterId) {
      return res.status(400).json({ error: "Semestre não selecionado pelo usuário." });
    }

    const selectedSemesterId = user.selectedSemesterId;

    const newQuestion = await prisma.qandA.create({
      data: {
        pergunta,
        user: {
          connect: { id: user.id },
        },
        subject: subjectId ? { connect: { id: subjectId } } : undefined,
        semester: {
          connect: { id: selectedSemesterId },
        },
      },
      include: {
        user: { select: { nome: true } },
        subject: { select: { nome: true } },
      },
    });

    return res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Erro ao adicionar pergunta:', error);
    return res.status(500).json({ message: 'Erro ao adicionar pergunta.' });
  }
}
