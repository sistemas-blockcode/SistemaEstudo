// /src/pages/api/quizzes/getQuizzes.ts

import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Método não permitido. Use GET." });
  }

  // Autenticação do Usuário
  const authToken = req.cookies.authToken;
  console.log(`authToken recebido: ${authToken ? "Presente" : "Ausente"}`);

  if (!authToken) {
    console.log("Erro: Token ausente no cookie.");
    return res
      .status(401)
      .json({ error: "Usuário não autenticado. Token ausente." });
  }

  try {
    // Verifica e decodifica o token JWT
    const decoded = jwt.verify(
      authToken,
      process.env.JWT_SECRET!
    ) as { userId: string };
    console.log(`Token decodificado. userId: ${decoded.userId}`);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { selectedSemester: true },
    });

    console.log(`Usuário encontrado: ${user ? user.email : "Não encontrado"}`);

    if (!user) {
      console.log("Erro: Usuário não encontrado no banco de dados.");
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    if (!user.selectedSemesterId) {
      console.log("Erro: Semestre não selecionado pelo usuário.");
      return res
        .status(400)
        .json({ error: "Semestre não selecionado pelo usuário." });
    }

    const selectedSemesterId = user.selectedSemesterId;
    console.log(`Semestre selecionado pelo usuário: ${selectedSemesterId}`);

    const { id, subjectId } = req.query;

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
          subject: true,
          user: true,
          semester: true,
        },
      });

      if (!quiz || quiz.semesterId !== selectedSemesterId) {
        return res.status(404).json({ error: "Simulado não encontrado." });
      }

      return res.status(200).json(quiz);
    }

    const whereClause: any = {
      semesterId: selectedSemesterId, // Filtragem por semestre
    };
    if (subjectId) whereClause.subjectId = subjectId as string;

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
        subject: true,
        user: true,
        semester: true,
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
