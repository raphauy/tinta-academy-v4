-- AlterTable
ALTER TABLE "WorkflowTemplate" ADD COLUMN     "sendAtHour" INTEGER NOT NULL DEFAULT 9,
ADD COLUMN     "sendAtMinute" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sendAtTimezone" TEXT NOT NULL DEFAULT 'America/Montevideo';
