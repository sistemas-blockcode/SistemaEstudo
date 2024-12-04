import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Método não permitido. Use GET." });
  }

  try {
    const semesters = await prisma.semester.findMany();
    return res.status(200).json(semesters);
  } catch (error) {
    console.error("Erro ao buscar semestres:", error);
    return res.status(500).json({ error: "Erro ao buscar semestres." });
  }
}
