import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  const { titulo, descricao, subjectId, perguntas, createdBy } = req.body;

  console.log("Dados recebidos:", {
    titulo,
    descricao,
    subjectId,
    perguntas,
    createdBy,
  });

  if (!titulo || !descricao || !Array.isArray(perguntas) || !createdBy) {
    console.error("Campos obrigatórios faltando ou inválidos");
    return res.status(400).json({ error: "Campos obrigatórios estão faltando." });
  }

  try {
    perguntas.forEach((pergunta, index) => {
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

    const quiz = await prisma.quiz.create({
      data: {
        titulo,
        descricao,
        createdBy,
        subjectId: subjectId || null,
        questions: {
          create: perguntas.map((pergunta) => ({
            enunciado: pergunta.enunciado,
            alternativas: pergunta.alternativas,
            respostaCorreta: pergunta.correta,
          })),
        },
      },
    });

    console.log("Simulado criado com sucesso:", quiz);

    return res.status(201).json({ success: true, quiz });
  } catch (error) {
    console.error("Erro ao criar o simulado:", error);
    return res.status(500).json({ error: "Erro interno ao criar o simulado." });
  }
}
