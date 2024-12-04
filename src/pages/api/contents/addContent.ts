import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import formidable, { File } from 'formidable';
import { ContentType } from '@prisma/client';

export const config = {
  api: {
    bodyParser: false, // Necessário para usar o formidable
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  // Configuração de `formidable`
  const form = formidable({
    maxFileSize: 10 * 1024 * 1024, // Define o limite máximo para cada arquivo como 10 MB
    maxTotalFileSize: 20 * 1024 * 1024, // Limite máximo total de todos os arquivos como 20 MB
    filename: () => `${uuidv4()}`, // Gera um nome único para cada arquivo
  });

  try {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Erro ao processar formulário:', err);
        if (err.httpCode === 413) {
          return res.status(413).json({ error: 'O arquivo enviado excede o tamanho permitido.' });
        }
        return res.status(500).json({ error: 'Erro ao processar o arquivo.' });
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

      // Ler o arquivo como buffer e salvar no banco
      const fileBuffer = arquivo ? await fs.promises.readFile((arquivo as File).filepath) : null;

      if (!fileBuffer) {
        return res.status(400).json({ error: 'Erro ao ler o arquivo.' });
      }

      try {
        const content = await prisma.content.create({
          data: {
            titulo: nomeConteudo,
            descricao: `Arquivo de tipo: ${tipoArquivo.toUpperCase()}`,
            tipo: tipoArquivo as ContentType,
            url: fileBuffer.toString('base64'), // Salva o arquivo em base64 no banco
            folderId,
          },
        });

        return res.status(201).json(content);
      } catch (dbError) {
        console.error('Erro ao salvar no banco de dados:', dbError);
        return res.status(500).json({ error: 'Erro ao salvar o conteúdo.' });
      }
    });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return res.status(500).json({ error: 'Erro inesperado no servidor.' });
  }
}
