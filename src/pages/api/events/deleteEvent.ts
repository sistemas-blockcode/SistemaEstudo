import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'ID do evento é obrigatório.' });
    }

    try {
      const deletedEvent = await prisma.event.delete({
        where: {
          id: eventId,
        },
      });

      res.status(200).json({ message: 'Evento excluído com sucesso.', deletedEvent });
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      res.status(500).json({ message: 'Erro ao excluir o evento.' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Método ${req.method} não permitido.`);
  }
}
