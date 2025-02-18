import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Método não permitido. Use GET.' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID do conteúdo é obrigatório.' });
  }

  try {
    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      return res.status(404).json({ error: 'Conteúdo não encontrado.' });
    }

    const buffer = Buffer.from(content.url!, 'base64');

    let contentType = 'application/octet-stream';
    let fileExtension = '';
    switch (content.tipo) {
      case 'PDF':
        contentType = 'application/pdf';
        fileExtension = '.pdf';
        break;
      case 'DOCX':
        contentType =
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        fileExtension = '.docx';
        break;
      case 'PPTX':
        contentType =
          'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        fileExtension = '.pptx';
        break;
      case 'IMG':
        contentType = content.titulo.endsWith('.png') ? 'image/png' : 'image/jpeg';
        fileExtension = content.titulo.endsWith('.png') ? '.png' : '.jpg';
        break;
      case 'VIDEO':
        contentType = 'video/mp4';
        fileExtension = '.mp4';
        break;
      case 'XLSX':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = '.xlsx';
        break;
      default:
        break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${content.titulo}${fileExtension}"` 
    );

    res.status(200).send(buffer);
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error);
    return res.status(500).json({ error: 'Erro ao buscar conteúdo.' });
  }
}
