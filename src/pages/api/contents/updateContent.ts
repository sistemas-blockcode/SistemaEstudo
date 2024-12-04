// api/contents/updateContent.ts
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ error: "Método não permitido. Use PUT." });
  }

  const { id, titulo } = req.body;

  if (!id || !titulo) {
    return res.status(400).json({ error: "ID e título são obrigatórios." });
  }

  try {
    const updatedContent = await prisma.content.update({
      where: { id },
      data: { titulo },
    });

    return res.status(200).json({ message: "Conteúdo atualizado com sucesso.", content: updatedContent });
  } catch (error) {
    console.error("Erro ao atualizar conteúdo:", error);
    return res.status(500).json({ error: "Erro ao atualizar conteúdo." });
  }
}
