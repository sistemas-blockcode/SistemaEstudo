// /src/pages/api/qanda/getQuestion.ts

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
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

    const { userId } = req.query;

    const whereClause: any = {
      semesterId: selectedSemesterId, // Filtragem por semestre
    };

    if (userId) whereClause.userId = userId as string;

    const questions = await prisma.qandA.findMany({
      where: whereClause,
      include: {
        respostas: {
          include: {
            autor: { select: { nome: true } },
          },
        },
        user: { select: { nome: true } },
        subject: { select: { nome: true } },
      },
    });

    res.status(200).json(questions);
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({ error: 'Failed to fetch questions.' });
  }
}
