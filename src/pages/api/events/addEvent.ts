import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, description, date, userId } = req.body;

    if (!title || !date || !userId) {
      return res.status(400).json({ message: 'Título, data e ID do usuário são obrigatórios.' });
    }

    try {

      const [year, month, day] = date.split('-').map(Number);
      const eventDate = new Date(Date.UTC(year, month - 1, day));

      const newEvent = await prisma.event.create({
        data: {
          titulo: title,
          descricao: description || '',
          data: eventDate, 
          createdBy: userId,
          userId,
        },
      });

      res.status(201).json(newEvent);
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
      res.status(500).json({ message: 'Erro ao adicionar o evento.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} não permitido.`);
  }
}
