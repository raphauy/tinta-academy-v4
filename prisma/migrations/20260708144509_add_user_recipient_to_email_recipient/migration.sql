-- DropForeignKey
ALTER TABLE "EmailRecipient" DROP CONSTRAINT "EmailRecipient_studentId_fkey";

-- AlterTable
ALTER TABLE "EmailRecipient" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "studentId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "EmailRecipient_userId_idx" ON "EmailRecipient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailRecipient_campaignId_userId_key" ON "EmailRecipient"("campaignId", "userId");

-- AddForeignKey
ALTER TABLE "EmailRecipient" ADD CONSTRAINT "EmailRecipient_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailRecipient" ADD CONSTRAINT "EmailRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
