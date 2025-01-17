import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Requisição recebida em /api/users/getMeNew"); // Log da requisição

  if (req.method !== "GET") {
    console.log("Método não permitido:", req.method); // Log do método inválido
    return res.status(405).json({ error: "Método não permitido" });
  }

  const authToken = req.cookies.authToken; // Lendo o cookie
  console.log("Cookie recebido:", authToken); // Log do cookie

  if (!authToken) {
    console.log("Erro: Token ausente no cookie"); // Log do erro
    return res.status(401).json({ error: "Usuário não autenticado. Token ausente." });
  }

  try {
    // Verifica o token
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as { userId: string };
    console.log("Token decodificado:", decoded); // Log do token decodificado

    // Busca o usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { selectedSemester: true },
    });

    console.log("Usuário encontrado no banco:", user); // Log do usuário encontrado

    if (!user) {
      console.log("Erro: Usuário não encontrado no banco"); // Log do erro
      return res.status(404).json({ error: "Usuário não encontrado no banco de dados." });
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate'); // Desabilitar cache
    console.log("Resposta enviada com sucesso"); // Log da resposta
    return res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao validar o token ou buscar o usuário:", error); // Log do erro
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}
