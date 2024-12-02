import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export function authenticateUser(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.authToken;
  if (!token) {
    res.status(401).json({ error: "Token de autenticação não encontrado" });
    throw new Error("Token de autenticação não encontrado");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch (error) {
    res.status(401).json({ error: "Token inválido ou expirado" });
    throw new Error("Token inválido ou expirado");
  }
}
