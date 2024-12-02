import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const userId = authenticateUser(req, res);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ message: 'Erro ao buscar informações do usuário' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
