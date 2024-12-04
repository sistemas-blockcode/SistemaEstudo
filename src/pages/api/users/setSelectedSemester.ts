import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  const { semesterId } = req.body;

  if (!semesterId) {
    return res.status(400).json({ error: "ID do semestre é obrigatório." });
  }

  try {
    // Use a sessão ou um ID fixo para identificar o usuário (ajuste aqui conforme o contexto do seu sistema).
    const userId = req.headers["user-id"]; // Substitua "user-id" por um cabeçalho correto se necessário

    if (!userId) {
      return res.status(400).json({ error: "Usuário não identificado." });
    }

    // Atualizar o usuário no banco de dados
    const updatedUser = await prisma.user.update({
      where: { id: userId as string }, // Use `id` ou `email` dependendo do seu contexto
      data: { selectedSemesterId: semesterId },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar semestre:", error);
    return res.status(500).json({ error: "Erro ao atualizar semestre." });
  }
}
