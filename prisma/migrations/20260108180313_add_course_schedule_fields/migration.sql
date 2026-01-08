-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "classDates" TIMESTAMP(3)[],
ADD COLUMN     "classDuration" INTEGER,
ADD COLUMN     "examDate" TIMESTAMP(3),
ADD COLUMN     "registrationDeadline" TIMESTAMP(3),
ADD COLUMN     "startTime" TEXT;
