-- AlterTable
ALTER TABLE "PublicComment" ADD COLUMN "adminReply" TEXT,
ADD COLUMN "adminReplyAt" TIMESTAMP(3),
ADD COLUMN "adminReplyById" TEXT;

-- CreateIndex
CREATE INDEX "PublicComment_sectionId_status_idx" ON "PublicComment"("sectionId", "status");
