import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Método não permitido. Use GET." });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "ID do usuário é obrigatório." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId as string },
      select: { selectedSemesterId: true },
    });

    if (!user || !user.selectedSemesterId) {
      return res.status(400).json({ error: "Semestre não selecionado." });
    }

    const folders = await prisma.folder.findMany({
      where: {
        user: {
          selectedSemesterId: user.selectedSemesterId,
        },
      },
    });

    return res.status(200).json(folders);
  } catch (error) {
    console.error("Erro ao buscar pastas:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}
