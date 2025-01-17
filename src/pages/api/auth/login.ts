import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { serialize } from "cookie";

export default async function loginHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Requisição recebida em /api/auth/login"); // Log inicial

  if (req.method !== "POST") {
    console.log("Método não permitido:", req.method); // Log do método inválido
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { email, password } = req.body;
  console.log("Dados recebidos no login:", { email, password }); // Log dos dados recebidos

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log("Usuário encontrado:", user); // Log do usuário encontrado

    if (!user) {
      console.log("Erro: Usuário não encontrado"); // Log do erro
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.senha);
    console.log("Senha válida:", isPasswordValid); // Log da validação da senha

    if (!isPasswordValid) {
      console.log("Erro: Senha incorreta"); // Log do erro
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    console.log("Token JWT gerado:", token); // Log do token gerado

    res.setHeader(
      "Set-Cookie",
      serialize("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600,
        path: "/",
      })
    );

    console.log("Cookie authToken configurado"); // Log do cookie configurado
    return res.status(200).json({
      message: "Login bem-sucedido",
      redirectTo: "/home",
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error); // Log do erro
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
}
