/*
  Warnings:

  - A unique constraint covering the columns `[academicYearId,name]` on the table `Semester` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AcademicYear" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Schedule_day_idx" ON "Schedule"("day");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_academicYearId_name_key" ON "Semester"("academicYearId", "name");
