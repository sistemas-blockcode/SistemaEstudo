import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const events = await prisma.event.findMany({
        select: {
          id: true, 
          titulo: true,
          descricao: true,
          data: true,
        },
      });

      const adjustedEvents = events.map((event) => ({
        ...event,
        data: new Date(event.data).setDate(new Date(event.data).getDate() + 1),
      }));

      res.status(200).json(adjustedEvents);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      res.status(500).json({ message: 'Erro ao buscar eventos.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Método ${req.method} não permitido.`);
  }
}
