/*
  Warnings:

  - You are about to drop the column `classId` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `day` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `Lesson` table. All the data in the column will be lost.
  - Added the required column `date` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduleId` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_classId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_teacherId_fkey";

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "classId",
DROP COLUMN "day",
DROP COLUMN "endTime",
DROP COLUMN "name",
DROP COLUMN "startTime",
DROP COLUMN "subjectId",
DROP COLUMN "teacherId",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "scheduleId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Schedule" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "day" "Day" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
