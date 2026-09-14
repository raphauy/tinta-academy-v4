-- AlterEnum
ALTER TYPE "CourseModality" ADD VALUE 'semipresencial';

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "virtualClassDates" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[];
