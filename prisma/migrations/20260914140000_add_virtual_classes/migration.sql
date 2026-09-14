-- AlterTable
ALTER TABLE "Course" DROP COLUMN "virtualClassDates";

-- CreateTable
CREATE TABLE "VirtualClass" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "streamingUrl" TEXT,
    "streamingPassword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirtualClass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VirtualClass_courseId_date_key" ON "VirtualClass"("courseId", "date");

-- AddForeignKey
ALTER TABLE "VirtualClass" ADD CONSTRAINT "VirtualClass_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

