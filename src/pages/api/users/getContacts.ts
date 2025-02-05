// /src/pages/api/users/getContacts.ts

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Método não permitido. Use GET.' });
  }

  const authToken = req.cookies.authToken;
  if (!authToken) {
    return res.status(401).json({ error: 'Usuário não autenticado. Token ausente.' });
  }

  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as { userId: string };
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { selectedSemester: true },
    });

    if (!currentUser || !currentUser.selectedSemesterId) {
      return res.status(400).json({ error: 'Usuário ou semestre não encontrado.' });
    }

    // Buscar usuários do mesmo semestre, excluindo o usuário atual
    const contacts = await prisma.user.findMany({
      where: {
        selectedSemesterId: currentUser.selectedSemesterId,
        NOT: { id: currentUser.id },
      },
      select: {
        id: true,
        nome: true,
      },
    });

    return res.status(200).json(contacts);
  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar contatos.' });
  }
}
