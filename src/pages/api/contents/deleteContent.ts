import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).json({ error: "Método não permitido. Use DELETE." });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "ID do conteúdo é obrigatório." });
  }

  try {

    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      return res.status(404).json({ error: "Conteúdo não encontrado." });
    }

    await prisma.content.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Conteúdo excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir conteúdo:", error);
    return res.status(500).json({ error: "Erro ao excluir conteúdo." });
  }
}
