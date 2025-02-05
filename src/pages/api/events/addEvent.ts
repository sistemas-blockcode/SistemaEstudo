// /src/pages/api/events/addEvent.ts

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  const { title, description, date } = req.body;

  console.log("Dados recebidos:", { title, description, date });

  if (!title || !date) {
    console.error("Campos obrigatórios faltando ou inválidos");
    return res.status(400).json({ error: "Campos obrigatórios estão faltando." });
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

    // Processa a data
    const eventDate = new Date(date);

    // Cria o evento associado ao semestre selecionado
    const newEvent = await prisma.event.create({
      data: {
        titulo: title,
        descricao: description || '',
        data: eventDate,
        createdBy: user.id, // Associado ao usuário que criou
        user: {
          connect: { id: user.id },
        },
        semester: {
          connect: { id: selectedSemesterId },
        },
      },
    });

    console.log("Evento criado com sucesso:", newEvent);

    return res.status(201).json(newEvent);
  } catch (error: any) {
    console.error("Erro ao adicionar evento:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      console.log("Erro: Token inválido.");
      return res.status(401).json({ error: "Token inválido." });
    }

    return res.status(500).json({ error: "Erro interno ao adicionar o evento." });
  }
}
