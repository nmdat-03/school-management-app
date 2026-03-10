"use server";

import { ActionResult } from "@/components/FormModal";
import { AssignmentSchema, assignmentSchema } from "../formValidationSchemas";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

/*-------------------------------------------------------*/
/*                  CREATE ASSIGNMENT                    */
/*-------------------------------------------------------*/
export async function createAssignment(
  data: AssignmentSchema,
): Promise<ActionResult> {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin") {
      throw new Error("Unauthorized");
    }

    if (data.startDate >= data.dueDate) {
      throw new Error("Invalid assignment time");
    }

    const semester = await prisma.semester.findUnique({
      where: { id: data.semesterId },
      include: { academicYear: true },
    });

    if (!semester?.academicYear.isActive) {
      throw new Error("Semester not in active academic year");
    }

    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        maxScore: data.maxScore ?? 10,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
        semesterId: data.semesterId,
      },
    });

    revalidatePath("/assignments");

    return { success: true };
  } catch (error) {
    console.log("Create assignment failed:", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                 UPDATE ASSIGNMENT                     */
/*-------------------------------------------------------*/
export async function updateAssignment(
  data: AssignmentSchema,
): Promise<ActionResult> {
  try {
    if (!data.id) throw new Error("Missing assignment id");

    assignmentSchema.parse(data);

    await prisma.assignment.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        maxScore: data.maxScore,

        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
        semesterId: data.semesterId,
      },
    });

    revalidatePath("/assignments");
    return { success: true };
  } catch (error) {
    console.log("Update assignment failed: ", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                  DELETE ASSIGNMENT                    */
/*-------------------------------------------------------*/
export const deleteAssignment = async (id: number): Promise<ActionResult> => {
  try {
    await prisma.assignment.delete({
      where: { id },
    });

    revalidatePath("/assignments");

    return { success: true };
  } catch (error) {
    console.log("Delete assignment failed: ", error);
    return { success: false };
  }
};
