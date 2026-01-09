-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "billingAddress" TEXT,
ADD COLUMN     "billingName" TEXT,
ADD COLUMN     "billingTaxId" TEXT,
ADD COLUMN     "notifyCourseUpdates" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyNewCourses" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyPromotions" BOOLEAN NOT NULL DEFAULT false;
