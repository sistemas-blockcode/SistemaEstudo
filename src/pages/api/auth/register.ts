import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { nome, email, senha, matricula } = req.body;

  try {
    
    const hashedPassword = await bcrypt.hash(senha, 10);

    
    const user = await prisma.user.create({
      data: {
        nome,
        matricula,
        senha: hashedPassword,
        email,
        tipo: 'ALUNO',
      },
    });

    res.status(201).json({ message: 'Usuário registrado com sucesso!', user });
  } catch (error) {
    if (error === 'P2002') {
      
      return res.status(400).json({ error: 'O email já está em uso.' });
    }
    res.status(500).json({ error: 'Erro ao registrar o usuário.' });
  }
}
