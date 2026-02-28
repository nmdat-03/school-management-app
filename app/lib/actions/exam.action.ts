"use server";

import { ActionResult } from "@/components/FormModal";
import { ExamSchema, examSchema } from "../formValidationSchemas";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";

/*-------------------------------------------------------*/
/*                    CREATE EXAM                        */
/*-------------------------------------------------------*/
export async function createExam(data: ExamSchema): Promise<ActionResult> {
  try {
    examSchema.parse(data);

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/exams");
    return { success: true };
  } catch (error) {
    console.log("Create exam failed: ", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                    UPDATE EXAM                        */
/*-------------------------------------------------------*/
export async function updateExam(data: ExamSchema): Promise<ActionResult> {
  try {
    if (!data.id) throw new Error("Missing exam id");

    examSchema.parse(data);

    await prisma.exam.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/exams");
    return { success: true };
  } catch (error) {
    console.log("Update exam failed: ", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                    DELETE EXAM                        */
/*-------------------------------------------------------*/
export const deleteExam = async (id: number): Promise<ActionResult> => {
  try {
    await prisma.exam.delete({
      where: { id },
    });

    revalidatePath("/exams");

    return { success: true };
  } catch (error) {
    console.log("Delete exam failed: ", error);
    return { success: false };
  }
};
