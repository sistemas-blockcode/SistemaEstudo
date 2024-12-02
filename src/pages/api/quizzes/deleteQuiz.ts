import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).json({ error: "Método não permitido. Use DELETE." });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "ID do quiz é obrigatório e deve ser uma string." });
  }

  try {

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
        answers: true,
      },
    });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz não encontrado." });
    }

    await prisma.quizAnswer.deleteMany({
      where: { quizId: id },
    });

    await prisma.quizQuestion.deleteMany({
      where: { quizId: id },
    });

    await prisma.quiz.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Quiz deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar o quiz:", error);
    return res.status(500).json({ error: "Erro interno ao deletar o quiz." });
  }
}
