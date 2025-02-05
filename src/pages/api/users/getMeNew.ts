// /api/users/getMeNew.ts

import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('--- /api/users/getMeNew ---');
  console.log(`Método da requisição: ${req.method}`);

  if (req.method !== 'GET') {
    console.log(`Método ${req.method} não permitido.`);
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Método ${req.method} não permitido.` });
  }

  const authToken = req.cookies.authToken;
  console.log(`authToken recebido: ${authToken ? 'Presente' : 'Ausente'}`);

  if (!authToken) {
    console.log('Erro: Token ausente no cookie.');
    return res.status(401).json({ error: 'Usuário não autenticado. Token ausente.' });
  }

  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as { userId: string };
    console.log(`Token decodificado. userId: ${decoded.userId}`);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { selectedSemester: true },
    });

    console.log(`Usuário encontrado: ${user ? user.email : 'Não encontrado'}`);

    if (!user) {
      console.log('Erro: Usuário não encontrado no banco de dados.');
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    console.log(`Semestre selecionado pelo usuário: ${user.selectedSemesterId}`);

    return res.status(200).json(user);
  } catch (error: any) {
    console.error('Erro ao validar o token ou buscar o usuário:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      console.log('Erro: Token inválido.');
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}
