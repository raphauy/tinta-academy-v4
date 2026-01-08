-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('link', 'image', 'document', 'video', 'other');

-- CreateTable
CREATE TABLE "CourseMaterial" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MaterialType" NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseMaterial_courseId_idx" ON "CourseMaterial"("courseId");

-- CreateIndex
CREATE INDEX "CourseMaterial_order_idx" ON "CourseMaterial"("order");

-- AddForeignKey
ALTER TABLE "CourseMaterial" ADD CONSTRAINT "CourseMaterial_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
