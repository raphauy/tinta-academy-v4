-- CreateEnum
CREATE TYPE "DiplomaStatus" AS ENUM ('pending', 'generating', 'generated', 'sending', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "DiplomaDateMode" AS ENUM ('last_class', 'custom');

-- CreateEnum
CREATE TYPE "DiplomaAnchor" AS ENUM ('left', 'center', 'right');

-- CreateTable
CREATE TABLE "DiplomaTemplate" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "baseImageUrl" TEXT NOT NULL,
    "baseImageWidth" INTEGER NOT NULL,
    "baseImageHeight" INTEGER NOT NULL,
    "nameFontFamily" TEXT NOT NULL DEFAULT 'Geist',
    "nameFontWeight" INTEGER NOT NULL DEFAULT 700,
    "nameFontSize" DOUBLE PRECISION NOT NULL,
    "nameColor" TEXT NOT NULL DEFAULT '#0A0A0A',
    "nameX" DOUBLE PRECISION NOT NULL,
    "nameY" DOUBLE PRECISION NOT NULL,
    "nameMaxWidth" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "nameAnchor" "DiplomaAnchor" NOT NULL DEFAULT 'left',
    "dateEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dateFontFamily" TEXT,
    "dateFontWeight" INTEGER,
    "dateFontSize" DOUBLE PRECISION,
    "dateColor" TEXT,
    "dateX" DOUBLE PRECISION,
    "dateY" DOUBLE PRECISION,
    "dateMaxWidth" DOUBLE PRECISION,
    "dateAnchor" "DiplomaAnchor",
    "dateFormat" TEXT DEFAULT 'd ''de'' MMMM ''de'' yyyy',
    "dateMode" "DiplomaDateMode" NOT NULL DEFAULT 'last_class',
    "dateCustomValue" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiplomaTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiplomaIssue" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "emailTo" TEXT NOT NULL,
    "pngUrl" TEXT,
    "pdfUrl" TEXT,
    "status" "DiplomaStatus" NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "resendId" TEXT,
    "generatedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiplomaIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiplomaTemplate_courseId_key" ON "DiplomaTemplate"("courseId");

-- CreateIndex
CREATE INDEX "DiplomaTemplate_courseId_idx" ON "DiplomaTemplate"("courseId");

-- CreateIndex
CREATE INDEX "DiplomaIssue_courseId_idx" ON "DiplomaIssue"("courseId");

-- CreateIndex
CREATE INDEX "DiplomaIssue_studentId_idx" ON "DiplomaIssue"("studentId");

-- CreateIndex
CREATE INDEX "DiplomaIssue_enrollmentId_idx" ON "DiplomaIssue"("enrollmentId");

-- CreateIndex
CREATE INDEX "DiplomaIssue_templateId_idx" ON "DiplomaIssue"("templateId");

-- CreateIndex
CREATE INDEX "DiplomaIssue_status_idx" ON "DiplomaIssue"("status");

-- CreateIndex
CREATE INDEX "DiplomaIssue_resendId_idx" ON "DiplomaIssue"("resendId");

-- CreateIndex
CREATE UNIQUE INDEX "DiplomaIssue_courseId_studentId_key" ON "DiplomaIssue"("courseId", "studentId");

-- AddForeignKey
ALTER TABLE "DiplomaTemplate" ADD CONSTRAINT "DiplomaTemplate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiplomaIssue" ADD CONSTRAINT "DiplomaIssue_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiplomaIssue" ADD CONSTRAINT "DiplomaIssue_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiplomaIssue" ADD CONSTRAINT "DiplomaIssue_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiplomaIssue" ADD CONSTRAINT "DiplomaIssue_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DiplomaTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
