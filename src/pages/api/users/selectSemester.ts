import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const authToken = req.cookies.authToken; // Obtendo o cookie `authToken`
  console.log("Cookie recebido:", authToken); // Log para verificar o token

  if (!authToken) {
    console.log("Erro: Token ausente no cookie"); // Log do erro
    return res.status(401).json({ error: "Usuário não autenticado. Token ausente." });
  }

  try {
    // Verifica e decodifica o token JWT
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as { userId: string };
    console.log("Token decodificado:", decoded); // Log do token decodificado

    const { semesterId } = req.body;

    if (!semesterId) {
      return res.status(400).json({ error: "Semestre não informado." });
    }

    // Atualiza o semestre selecionado no banco
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { selectedSemesterId: semesterId },
    });

    console.log("Semestre atualizado com sucesso.");
    return res.status(200).json({ message: "Semestre selecionado com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar o semestre:", error);
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}
