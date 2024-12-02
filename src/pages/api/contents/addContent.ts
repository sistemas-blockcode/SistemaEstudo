import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import formidable, { File } from 'formidable';
import { ContentType } from '@prisma/client';

export const config = {
  api: {
    bodyParser: false,
  },
};

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  // Configuração do `formidable`
  const form = formidable({
    uploadDir: UPLOADS_DIR,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5 MB
    filename: () => `${uuidv4()}`,
  });

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Erro ao processar formulário:', err);
      return res.status(500).json({ error: 'Erro ao processar arquivo.' });
    }

    const nomeConteudo = Array.isArray(fields.nomeConteudo) ? fields.nomeConteudo[0] : fields.nomeConteudo;
    const tipoArquivo = Array.isArray(fields.tipoArquivo) ? fields.tipoArquivo[0] : fields.tipoArquivo;
    const folderId = Array.isArray(fields.folderId) ? fields.folderId[0] : fields.folderId;
    const arquivo = Array.isArray(files.arquivo) ? files.arquivo[0] : files.arquivo;

    if (!nomeConteudo || !tipoArquivo || !arquivo || !folderId) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    if (!Object.values(ContentType).includes(tipoArquivo as ContentType)) {
      return res.status(400).json({ error: 'Tipo de arquivo inválido.' });
    }

    try {
      const content = await prisma.content.create({
        data: {
          titulo: nomeConteudo,
          descricao: `Arquivo de tipo: ${tipoArquivo.toUpperCase()}`,
          tipo: tipoArquivo as ContentType,
          url: `/uploads/${path.basename((arquivo as File).filepath)}`,
          folderId,
        },
      });

      return res.status(201).json(content);
    } catch (error) {
      console.error('Erro ao salvar no banco de dados:', error);
      return res.status(500).json({ error: 'Erro ao salvar conteúdo.' });
    }
  });
}
