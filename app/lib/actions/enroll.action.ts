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
  academicYearId: number
): Promise<ActionResult> {
  try {
    /* check duplicate enrollment */
    const existing = await prisma.enrollment.findFirst({
      where: {
        studentId,
        academicYearId,
      },
    });

    if (existing) {
      throw new Error("Student already enrolled in this academic year");
    }

    /* check class capacity */
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

    revalidatePath("/list/students");

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
  academicYearId: number
): Promise<ActionResult> {
  try {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId,
        academicYearId,
      },
    });

    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    await prisma.enrollment.update({
      where: {
        id: enrollment.id,
      },
      data: {
        classId,
      },
    });

    revalidatePath("/list/students");

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
  academicYearId: number
): Promise<ActionResult> {
  try {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId,
        academicYearId,
      },
    });

    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    await prisma.enrollment.delete({
      where: {
        id: enrollment.id,
      },
    });

    revalidatePath("/list/students");

    return { success: true };
  } catch (error) {
    console.log("Delete enrollment failed:", error);
    return { success: false };
  }
}