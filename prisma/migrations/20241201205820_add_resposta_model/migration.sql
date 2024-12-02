-- CreateTable
CREATE TABLE "Resposta" (
    "id" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "dataResposta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "perguntaId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,

    CONSTRAINT "Resposta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Resposta" ADD CONSTRAINT "Resposta_perguntaId_fkey" FOREIGN KEY ("perguntaId") REFERENCES "QandA"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resposta" ADD CONSTRAINT "Resposta_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
