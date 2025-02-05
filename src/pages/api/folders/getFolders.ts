// /api/folders/getFolders.ts

import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('--- /api/folders/getFolders ---');
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
    // Verifica e decodifica o token JWT
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as { userId: string };
    console.log(`Token decodificado. userId: ${decoded.userId}`);

    const userId = decoded.userId;

    // Busca o usuário no banco de dados, incluindo o semestre selecionado
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { selectedSemester: true },
    });

    console.log(`Usuário encontrado: ${user ? user.email : 'Não encontrado'}`);

    if (!user) {
      console.log('Erro: Usuário não encontrado no banco de dados.');
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (!user.selectedSemesterId) {
      console.log('Erro: Semestre não selecionado pelo usuário.');
      return res.status(400).json({ error: 'Semestre não selecionado pelo usuário.' });
    }

    const selectedSemesterId = user.selectedSemesterId;
    console.log(`Semestre selecionado pelo usuário: ${selectedSemesterId}`);

    // Busca as pastas que contêm conteúdos relacionados ao semestre selecionado
    const folders = await prisma.folder.findMany({
      where: {
        semesterId: selectedSemesterId,
      },
      include: {
        contents: {
          where: {
            subject: {
              semesterId: selectedSemesterId,
            },
          },
          include: {
            subject: true, // Inclui informações do subject para verificar o semestre
          },
        },
        user: true, // Inclui informações do usuário que criou a pasta, se necessário
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Número de pastas encontradas: ${folders.length}`);
    folders.forEach((folder, index) => {
      console.log(`Pasta ${index + 1}: ${folder.name}`);
      console.log(`Número de conteúdos na pasta: ${folder.contents.length}`);
      folder.contents.forEach((content, idx) => {
        console.log(`  Conteúdo ${idx + 1}: ${content.titulo}, Semestre: ${content.subject?.semesterId}`);
      });
    });

    return res.status(200).json(folders);
  } catch (error: any) {
    console.error('Erro ao listar pastas com filtragem por semestre:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      console.log('Erro: Token inválido.');
      return res.status(401).json({ error: 'Token inválido.' });
    }

    return res.status(500).json({ error: 'Erro ao listar pastas.' });
  }
}
