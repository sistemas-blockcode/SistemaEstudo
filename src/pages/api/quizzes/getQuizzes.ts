import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Método não permitido. Use GET." });
  }

  try {
    const { id, subjectId, createdBy } = req.query;

    if (id) {
      const quiz = await prisma.quiz.findUnique({
        where: { id: id as string },
        include: {
          questions: {
            select: {
              id: true,
              enunciado: true,
              alternativas: true,
              respostaCorreta: true,
            },
          },
        },
      });

      if (!quiz) {
        return res.status(404).json({ error: "Simulado não encontrado." });
      }

      return res.status(200).json(quiz);
    }

    const whereClause: any = {};
    if (subjectId) whereClause.subjectId = subjectId as string;
    if (createdBy) whereClause.createdBy = createdBy as string;

    const quizzes = await prisma.quiz.findMany({
      where: whereClause,
      include: {
        questions: {
          select: {
            id: true,
            enunciado: true,
            alternativas: true,
          },
        },
      },
      orderBy: {
        titulo: "asc",
      },
    });

    return res.status(200).json(quizzes);
  } catch (error) {
    console.error("Erro ao buscar simulados:", error);
    return res.status(500).json({ error: "Erro interno ao buscar simulados." });
  }
}