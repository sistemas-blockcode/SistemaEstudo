// /src/pages/api/folders/addFolder.ts

import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nome da pasta é obrigatório.' });
    }

    const authToken = req.cookies.authToken;
    console.log(`authToken recebido: ${authToken ? 'Presente' : 'Ausente'}`);

    if (!authToken) {
      console.log('Erro: Token ausente no cookie.');
      return res.status(401).json({ message: 'Usuário não autenticado. Token ausente.' });
    }

    try {
      // Verifica e decodifica o token JWT
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as { userId: string };
      console.log(`Token decodificado. userId: ${decoded.userId}`);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { selectedSemester: true },
      });

      console.log(`Usuário encontrado: ${user ? user.email : 'Não encontrado'}`);

      if (!user) {
        console.log('Erro: Usuário não encontrado no banco de dados.');
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      if (!user.selectedSemesterId) {
        console.log('Erro: Semestre não selecionado pelo usuário.');
        return res.status(400).json({ message: 'Semestre não selecionado pelo usuário.' });
      }

      const selectedSemesterId = user.selectedSemesterId;
      console.log(`Semestre selecionado pelo usuário: ${selectedSemesterId}`);

      // Verifica se uma pasta com o mesmo nome já existe no semestre selecionado
      const folderExists = await prisma.folder.findFirst({
        where: {
          name: name,
          semesterId: selectedSemesterId,
        },
      });

      if (folderExists) {
        return res.status(409).json({ message: 'Já existe uma pasta com este nome no semestre selecionado.' });
      }

      // Cria a nova pasta associada ao semestre selecionado
      const newFolder = await prisma.folder.create({
        data: {
          name,
          semester: {
            connect: { id: selectedSemesterId },
          },
          user: { // Utilize o campo de relação `user` em vez de `createdBy`
            connect: { id: user.id },
          },
        },
      });
      

      console.log(`Nova pasta criada: ${newFolder.id} - ${newFolder.name}`);
      return res.status(201).json(newFolder);
    } catch (error: any) {
      console.error('Erro ao criar pasta:', error);

      if (error instanceof jwt.JsonWebTokenError) {
        console.log('Erro: Token inválido.');
        return res.status(401).json({ message: 'Token inválido.' });
      }

      return res.status(500).json({ message: 'Erro ao criar pasta.' });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Método ${req.method} não permitido.`);
}
