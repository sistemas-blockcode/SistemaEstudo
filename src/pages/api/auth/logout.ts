import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default async function logoutHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    res.setHeader(
      "Set-Cookie",
      serialize("authToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: -1,
        path: "/",
      })
    );

    return res.status(200).json({ message: "Logout bem-sucedido" });
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return res.status(500).json({ error: "Erro ao fazer logout" });
  }
}
