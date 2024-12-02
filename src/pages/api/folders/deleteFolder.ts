import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'O ID da pasta é obrigatório.' });
    }

    try {
      // Verifica se a pasta existe
      const folder = await prisma.folder.findUnique({
        where: { id },
        include: { contents: true }, // Inclui os conteúdos relacionados
      });

      if (!folder) {
        return res.status(404).json({ message: 'Pasta não encontrada.' });
      }

      // Verifica se existem conteúdos dentro da pasta e deleta
      if (folder.contents.length > 0) {
        await prisma.content.deleteMany({
          where: { folderId: id },
        });
      }

      // Deleta a pasta
      await prisma.folder.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Pasta excluída com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir a pasta:', error);
      return res.status(500).json({ message: 'Erro interno ao excluir a pasta.' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  }
}
