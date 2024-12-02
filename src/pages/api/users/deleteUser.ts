import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID do usuário é obrigatório' });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
    return res.status(200).json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao excluir usuário' });
  } finally {
    await prisma.$disconnect();
  }
}
