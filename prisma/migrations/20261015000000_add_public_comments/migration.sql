-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "PublicComment" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "sectionTitle" TEXT NOT NULL,
    "bookTitle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "text" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moderatedAt" TIMESTAMP(3),
    "moderatedById" TEXT,

    CONSTRAINT "PublicComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PublicComment_sectionId_idx" ON "PublicComment"("sectionId");

-- CreateIndex
CREATE INDEX "PublicComment_status_idx" ON "PublicComment"("status");

-- CreateIndex
CREATE INDEX "PublicComment_createdAt_idx" ON "PublicComment"("createdAt");
