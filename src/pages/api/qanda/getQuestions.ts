import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const { userId } = req.query;

  try {
    // If userId is provided, filter questions by userId
    const questions = await prisma.qandA.findMany({
      where: userId ? { userId: userId as string } : {},
      include: {
        respostas: {
          include: {
            autor: { select: { nome: true } },
          },
        },
        user: { select: { nome: true } },
      },
    });

    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions.' });
  }
}
