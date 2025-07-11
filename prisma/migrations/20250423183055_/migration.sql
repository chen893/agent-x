/*
  Warnings:

  - You are about to drop the column `tempSessionId` on the `CodeFile` table. All the data in the column will be lost.
  - You are about to drop the column `tempSessionId` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the `TempSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CodeFile" DROP CONSTRAINT "CodeFile_tempSessionId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_tempSessionId_fkey";

-- DropForeignKey
ALTER TABLE "TempSession" DROP CONSTRAINT "TempSession_userId_fkey";

-- AlterTable
ALTER TABLE "CodeFile" DROP COLUMN "tempSessionId";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "tempSessionId";

-- DropTable
DROP TABLE "TempSession";
