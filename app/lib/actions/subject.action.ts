"use server";
import { SubjectSchema, subjectSchema } from "../formValidationSchemas";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/components/FormModal";

/*-------------------------------------------------------*/
/*                    CREATE SUBJECT                     */
/*-------------------------------------------------------*/
export async function createSubject(
  data: SubjectSchema,
): Promise<ActionResult> {
  try {
    subjectSchema.parse(data);

    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    revalidatePath("/subjects");
    return { success: true };
  } catch (error) {
    console.log("Create subject failed: ", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                    UPDATE SUBJECT                     */
/*-------------------------------------------------------*/
export async function updateSubject(
  data: SubjectSchema,
): Promise<ActionResult> {
  try {
    if (!data.id) throw new Error("Missing subject id");

    subjectSchema.parse(data);

    await prisma.subject.update({
      where: { id: data.id },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    revalidatePath("/subjects");
    return { success: true };
  } catch (error) {
    console.log("Update subject failed: ", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                    DELETE SUBJECT                     */
/*-------------------------------------------------------*/
export const deleteSubject = async (id: number): Promise<ActionResult> => {
  try {
    await prisma.subject.delete({
      where: { id },
    });

    revalidatePath("/subjects");

    return { success: true };
  } catch (error) {
    console.log("Delete subject failed: ", error);
    return { success: false };
  }
};
