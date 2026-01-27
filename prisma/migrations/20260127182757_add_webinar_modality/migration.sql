-- AlterEnum
ALTER TYPE "CourseModality" ADD VALUE 'webinar';

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "streamingPassword" TEXT,
ADD COLUMN     "streamingUrl" TEXT;
