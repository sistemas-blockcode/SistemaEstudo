// /src/pages/api/quizzes/addQuizz.ts

import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  const { titulo, descricao, subjectId, perguntas } = req.body;

  console.log("Dados recebidos:", {
    titulo,
    descricao,
    subjectId,
    perguntas,
  });

  if (
    !titulo ||
    !descricao ||
    !Array.isArray(perguntas) ||
    perguntas.length === 0
  ) {
    console.error("Campos obrigatórios faltando ou inválidos");
    return res.status(400).json({ error: "Campos obrigatórios estão faltando." });
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

    // Validação das Perguntas
    perguntas.forEach((pergunta: any, index: number) => {
      console.log(`Validando pergunta ${index + 1}:`, pergunta);
      if (
        !pergunta.enunciado ||
        !Array.isArray(pergunta.alternativas) ||
        pergunta.alternativas.length !== 4 ||
        !pergunta.correta
      ) {
        throw new Error(`Dados inválidos para a pergunta ${index + 1}`);
      }
    });

    // Criação do Quiz com Relação ao Usuário, Subject e Semester
    const quiz = await prisma.quiz.create({
      data: {
        titulo,
        descricao,
        user: {
          connect: { id: user.id },
        },
        subject: subjectId
          ? {
              connect: { id: subjectId },
            }
          : undefined,
        semester: {
          connect: { id: selectedSemesterId },
        },
        questions: {
          create: perguntas.map((pergunta: any) => ({
            enunciado: pergunta.enunciado,
            alternativas: pergunta.alternativas,
            respostaCorreta: pergunta.correta,
          })),
        },
      },
    });

    console.log("Simulado criado com sucesso:", quiz);

    return res.status(201).json({ success: true, quiz });
  } catch (error: any) {
    console.error("Erro ao criar o simulado:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      console.log("Erro: Token inválido.");
      return res.status(401).json({ error: "Token inválido." });
    }
    return res
      .status(500)
      .json({ error: "Erro interno ao criar o simulado." });
  }
}
