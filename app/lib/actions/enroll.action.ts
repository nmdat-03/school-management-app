"use server";

import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/components/FormModal";

/*-------------------------------------------------------*/
/*                  CREATE ENROLLMENT                    */
/*-------------------------------------------------------*/
export async function createEnrollment(
  studentId: string,
  classId: number,
  academicYearId: number,
): Promise<ActionResult> {
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!classItem) {
      throw new Error("Class not found");
    }

    if (classItem.capacity <= classItem._count.enrollments) {
      throw new Error("Class is full");
    }

    await prisma.enrollment.create({
      data: {
        studentId,
        classId,
        academicYearId,
      },
    });

    revalidatePath("/students");

    return { success: true };
  } catch (error) {
    console.log("Create enrollment failed:", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                  UPDATE ENROLLMENT                    */
/*-------------------------------------------------------*/
export async function updateEnrollment(
  studentId: string,
  classId: number,
  academicYearId: number,
): Promise<ActionResult> {
  try {
    await prisma.enrollment.updateMany({
      where: {
        studentId,
        academicYearId,
      },
      data: {
        classId,
      },
    });

    revalidatePath("/students");

    return { success: true };
  } catch (error) {
    console.log("Update enrollment failed:", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                  DELETE ENROLLMENT                    */
/*-------------------------------------------------------*/
export async function deleteEnrollment(
  studentId: string,
  academicYearId: number,
): Promise<ActionResult> {
  try {
    await prisma.enrollment.deleteMany({
      where: {
        studentId,
        academicYearId,
      },
    });

    revalidatePath("/students");

    return { success: true };
  } catch (error) {
    console.log("Delete enrollment failed:", error);
    return { success: false };
  }
}