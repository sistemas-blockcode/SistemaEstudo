import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ error: "Método não permitido. Use PUT." });
  }

  const { newPassword } = req.body;
  const userId = req.headers["user-id"] as string;

  console.log("Iniciando redefinição de senha...");
  console.log("Dados recebidos:", { userId, newPassword });

  if (!userId) {
    console.log("Erro: Usuário não identificado.");
    return res.status(400).json({ error: "Usuário não identificado." });
  }

  if (!newPassword || newPassword.trim().length < 6) {
    console.log("Erro: A nova senha não atende aos requisitos.");
    return res.status(400).json({
      error: "A nova senha é obrigatória e deve conter pelo menos 6 caracteres.",
    });
  }

  try {
    // Criptografar a nova senha
    console.log("Criptografando a senha...");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar a senha no banco de dados
    console.log("Atualizando senha no banco para o usuário:", userId);
    await prisma.user.update({
      where: { id: userId },
      data: { senha: hashedPassword },
    });

    console.log("Senha redefinida com sucesso para o usuário:", userId);
    return res.status(200).json({ message: "Senha redefinida com sucesso." });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return res.status(500).json({ error: "Erro ao redefinir senha." });
  }
}
