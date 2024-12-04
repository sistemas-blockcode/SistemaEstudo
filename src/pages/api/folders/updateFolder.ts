import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ error: "Método não permitido. Use PUT." });
  }

  const { id, name } = req.body;

  // Valida os campos obrigatórios
  if (!id || !name || name.trim() === "") {
    return res.status(400).json({ error: "ID e novo nome da pasta são obrigatórios." });
  }

  try {
    // Verifica se a pasta existe
    const existingFolder = await prisma.folder.findUnique({
      where: { id },
    });

    if (!existingFolder) {
      return res.status(404).json({ error: "Pasta não encontrada." });
    }

    // Verifica se o novo nome já está sendo usado por outra pasta
    const duplicateFolder = await prisma.folder.findUnique({
      where: { name },
    });

    if (duplicateFolder && duplicateFolder.id !== id) {
      return res.status(409).json({ error: "Já existe uma pasta com esse nome." });
    }

    // Atualiza o nome da pasta
    const updatedFolder = await prisma.folder.update({
      where: { id },
      data: { name },
    });

    return res.status(200).json({
      message: "Pasta atualizada com sucesso.",
      folder: updatedFolder,
    });
  } catch (error) {
    console.error("Erro ao atualizar pasta:", error);
    return res.status(500).json({ error: "Erro ao atualizar a pasta." });
  }
}
