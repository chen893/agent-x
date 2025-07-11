-- AlterTable
ALTER TABLE "CodeFile" ADD COLUMN     "tempSessionId" TEXT;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "tempSessionId" TEXT;

-- CreateTable
CREATE TABLE "TempSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "requirement" TEXT,
    "documentData" TEXT,
    "codeData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "isSynced" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TempSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TempSession_sessionToken_key" ON "TempSession"("sessionToken");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_tempSessionId_fkey" FOREIGN KEY ("tempSessionId") REFERENCES "TempSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeFile" ADD CONSTRAINT "CodeFile_tempSessionId_fkey" FOREIGN KEY ("tempSessionId") REFERENCES "TempSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TempSession" ADD CONSTRAINT "TempSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
