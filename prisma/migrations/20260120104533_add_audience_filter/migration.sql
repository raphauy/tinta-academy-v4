-- AlterTable
ALTER TABLE "EmailCampaign" ADD COLUMN     "audienceFilterId" TEXT;

-- CreateTable
CREATE TABLE "AudienceFilter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "educatorId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "conditions" TEXT NOT NULL,
    "cachedStudentCount" INTEGER,
    "cachedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudienceFilter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AudienceFilter_educatorId_idx" ON "AudienceFilter"("educatorId");

-- CreateIndex
CREATE INDEX "AudienceFilter_isPublic_idx" ON "AudienceFilter"("isPublic");

-- CreateIndex
CREATE INDEX "EmailCampaign_audienceFilterId_idx" ON "EmailCampaign"("audienceFilterId");

-- AddForeignKey
ALTER TABLE "EmailCampaign" ADD CONSTRAINT "EmailCampaign_audienceFilterId_fkey" FOREIGN KEY ("audienceFilterId") REFERENCES "AudienceFilter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceFilter" ADD CONSTRAINT "AudienceFilter_educatorId_fkey" FOREIGN KEY ("educatorId") REFERENCES "Educator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
