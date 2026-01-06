-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('wset', 'taller', 'cata', 'curso');

-- CreateEnum
CREATE TYPE "CourseModality" AS ENUM ('presencial', 'online');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('announced', 'enrolling', 'full', 'in_progress', 'finished', 'available');

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "CourseType" NOT NULL,
    "modality" "CourseModality" NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "duration" TEXT,
    "maxCapacity" INTEGER,
    "enrolledCount" INTEGER NOT NULL DEFAULT 0,
    "priceUSD" DOUBLE PRECISION NOT NULL,
    "location" TEXT,
    "address" TEXT,
    "imageUrl" TEXT,
    "status" "CourseStatus" NOT NULL,
    "educatorId" TEXT NOT NULL,
    "wsetLevel" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscription" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NewsletterSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CourseToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CourseToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_slug_idx" ON "Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_slug_idx" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_educatorId_idx" ON "Course"("educatorId");

-- CreateIndex
CREATE INDEX "Course_status_idx" ON "Course"("status");

-- CreateIndex
CREATE INDEX "Course_type_idx" ON "Course"("type");

-- CreateIndex
CREATE INDEX "Course_modality_idx" ON "Course"("modality");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscription_email_key" ON "NewsletterSubscription"("email");

-- CreateIndex
CREATE INDEX "NewsletterSubscription_email_idx" ON "NewsletterSubscription"("email");

-- CreateIndex
CREATE INDEX "NewsletterSubscription_isActive_idx" ON "NewsletterSubscription"("isActive");

-- CreateIndex
CREATE INDEX "_CourseToTag_B_index" ON "_CourseToTag"("B");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_educatorId_fkey" FOREIGN KEY ("educatorId") REFERENCES "Educator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToTag" ADD CONSTRAINT "_CourseToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToTag" ADD CONSTRAINT "_CourseToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
