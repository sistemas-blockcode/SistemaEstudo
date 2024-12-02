import { NextApiRequest, NextApiResponse } from 'next';
import {  UserType } from '@prisma/client';

import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID do usuário é obrigatório' });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { tipo: UserType.ADMIN },
    });

    return res.status(200).json({ message: 'Usuário promovido para ADMIN', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao promover usuário' });
  } finally {
    await prisma.$disconnect();
  }
}
