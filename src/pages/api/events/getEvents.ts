// /src/pages/api/events/getEvents.ts

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Método não permitido. Use GET." });
  }

  // Autenticação do Usuário
  const authToken = req.cookies.authToken;
  console.log(`authToken recebido: ${authToken ? "Presente" : "Ausente"}`);

  if (!authToken) {
    console.log("Erro: Token ausente no cookie.");
    return res.status(401).json({ error: "Usuário não autenticado. Token ausente." });
  }

  try {
    // Verifica e decodifica o token JWT
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as { userId: string };
    console.log(`Token decodificado. userId: ${decoded.userId}`);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { selectedSemester: true },
    });

    console.log(`Usuário encontrado: ${user ? user.email : "Não encontrado"}`);

    if (!user) {
      console.log("Erro: Usuário não encontrado no banco de dados.");
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    if (!user.selectedSemesterId) {
      console.log("Erro: Semestre não selecionado pelo usuário.");
      return res.status(400).json({ error: "Semestre não selecionado pelo usuário." });
    }

    const selectedSemesterId = user.selectedSemesterId;
    console.log(`Semestre selecionado pelo usuário: ${selectedSemesterId}`);

    const { id } = req.query;

    if (id) {
      const event = await prisma.event.findUnique({
        where: { id: id as string },
        include: {
          user: true,
          semester: true,
        },
      });

      if (!event || event.semesterId !== selectedSemesterId) {
        return res.status(404).json({ error: "Evento não encontrado." });
      }

      return res.status(200).json(event);
    }

    // Busca todos os eventos do semestre selecionado
    const events = await prisma.event.findMany({
      where: {
        semesterId: selectedSemesterId,
      },
      include: {
        user: true,
        semester: true,
      },
      orderBy: {
        data: "asc",
      },
    });

    return res.status(200).json(events);
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    return res.status(500).json({ error: "Erro interno ao buscar eventos." });
  }
}
