"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AcademicYearSchema } from "@/lib/formValidationSchemas";
import { ActionResult } from "@/components/FormModal";

/*-------------------------------------------------------*/
/*              CREATE ACADEMIC YEAR                     */
/*-------------------------------------------------------*/
export async function createAcademicYear(
  data: AcademicYearSchema,
): Promise<ActionResult> {
  try {
    await prisma.$transaction(async (tx) => {
      const year = await tx.academicYear.create({
        data: {
          name: data.name,
          startDate: data.semester1Start,
          endDate: data.semester2End,
        },
      });

      await tx.semester.createMany({
        data: [
          {
            name: "Semester 1",
            startDate: data.semester1Start,
            endDate: data.semester1End,
            academicYearId: year.id,
          },
          {
            name: "Semester 2",
            startDate: data.semester2Start,
            endDate: data.semester2End,
            academicYearId: year.id,
          },
        ],
      });
    });

    revalidatePath("/academic-years");

    return { success: true };
  } catch (error) {
    console.log("Create academic year failed:", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*              UPDATE ACADEMIC YEAR                     */
/*-------------------------------------------------------*/
export async function updateAcademicYear(
  data: AcademicYearSchema,
): Promise<ActionResult> {
  try {
    if (!data.id) throw new Error("Academic year id missing");

    await prisma.$transaction(async (tx) => {
      await tx.academicYear.update({
        where: { id: data.id },
        data: {
          name: data.name,
          startDate: data.semester1Start,
          endDate: data.semester2End,
        },
      });

      await tx.semester.updateMany({
        where: {
          academicYearId: data.id,
          name: "Semester 1",
        },
        data: {
          startDate: data.semester1Start,
          endDate: data.semester1End,
        },
      });

      await tx.semester.updateMany({
        where: {
          academicYearId: data.id,
          name: "Semester 2",
        },
        data: {
          startDate: data.semester2Start,
          endDate: data.semester2End,
        },
      });
    });

    revalidatePath("/academic-years");

    return { success: true };
  } catch (error) {
    console.log("Update academic year failed:", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*              DELETE ACADEMIC YEAR                     */
/*-------------------------------------------------------*/
export async function deleteAcademicYear(id: number): Promise<ActionResult> {
  try {
    const semester = await prisma.semester.findFirst({
      where: { academicYearId: id },
      include: {
        exams: true,
        assignments: true,
      },
    });

    if (semester && (semester.exams.length || semester.assignments.length)) {
      return { success: false };
    }

    await prisma.$transaction([
      prisma.semester.deleteMany({
        where: { academicYearId: id },
      }),
      prisma.academicYear.delete({
        where: { id },
      }),
    ]);

    revalidatePath("/academic-years");

    return { success: true };
  } catch (error) {
    console.log("Delete academic year failed:", error);
    return { success: false };
  }
}
