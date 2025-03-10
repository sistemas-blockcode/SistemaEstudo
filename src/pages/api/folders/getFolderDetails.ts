// /api/folders/getFolderDetails.ts
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('--- /api/folders/getFolderDetails ---');
  console.log(`Método da requisição: ${req.method}`);

  if (req.method !== 'GET') {
    console.log(`Método ${req.method} não permitido.`);
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Método ${req.method} não permitido.` });
  }

  const { id: folderId } = req.query;
  console.log(`folderId recebido: ${folderId}`);

  if (!folderId || typeof folderId !== 'string') {
    console.log('Erro: folderId ausente ou inválido.');
    return res.status(400).json({ error: 'ID da pasta é obrigatório e deve ser uma string.' });
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

    // Busca o usuário e seu semestre selecionado
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    // Busca a pasta informada e seus conteúdos sem filtrar por subject
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        contents: true,
        user: true, // informação do usuário que criou a pasta, se necessário
      },
    });

    if (!folder) {
      console.log('Erro: Pasta não encontrada.');
      return res.status(404).json({ error: 'Pasta não encontrada.' });
    }

    // Verifica se a pasta pertence ao semestre selecionado pelo usuário
    if (folder.semesterId !== selectedSemesterId) {
      console.log('Acesso proibido: A pasta não pertence ao semestre selecionado pelo usuário.');
      return res
        .status(403)
        .json({ error: 'Acesso proibido. A pasta não pertence ao semestre selecionado.' });
    }

    console.log(`Pasta encontrada: ${folder.name}`);
    console.log(`Número de conteúdos na pasta: ${folder.contents.length}`);
    folder.contents.forEach((content, idx) => {
      console.log(`  Conteúdo ${idx + 1}: ${content.titulo}`);
    });

    // Retorna a pasta e todos os conteúdos sem filtrar por subject
    return res.status(200).json({
      ...folder,
      contents: folder.contents || [],
    });
  } catch (error: any) {
    console.error('Erro ao buscar detalhes da pasta sem filtrar por subject:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      console.log('Erro: Token inválido.');
      return res.status(401).json({ error: 'Token inválido.' });
    }

    return res.status(500).json({ error: 'Erro ao buscar detalhes da pasta.' });
  }
}
