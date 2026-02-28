"use server";

import { ActionResult } from "@/components/FormModal";
import { ClassSchema, classSchema } from "../formValidationSchemas";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";

/*-------------------------------------------------------*/
/*                    CREATE CLASS                       */
/*-------------------------------------------------------*/
export async function createClass(data: ClassSchema): Promise<ActionResult> {
  try {
    classSchema.parse(data);

    await prisma.class.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        grade: {
          connect: { id: data.gradeId },
        },
        ...(data.supervisorId && {
          supervisor: {
            connect: { id: data.supervisorId },
          },
        }),
      },
    });

    revalidatePath("/classes");
    return { success: true };
  } catch (error) {
    console.log("Create class failed: ", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                    UPDATE CLASS                       */
/*-------------------------------------------------------*/
export async function updateClass(data: ClassSchema): Promise<ActionResult> {
  try {
    if (!data.id) throw new Error("Missing class id");

    classSchema.parse(data);

    await prisma.class.update({
      where: { id: data.id },
      data: {
        name: data.name,
        capacity: data.capacity,
        grade: {
          connect: { id: data.gradeId },
        },
        supervisor: data.supervisorId
          ? { connect: { id: data.supervisorId } }
          : { disconnect: true },
      },
    });

    revalidatePath("/classes");
    return { success: true };
  } catch (error) {
    console.log("Update class failed: ", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                    DELETE CLASS                       */
/*-------------------------------------------------------*/
export const deleteClass = async (id: number): Promise<ActionResult> => {
  try {
    await prisma.class.delete({
      where: { id },
    });

    revalidatePath("/classes");

    return { success: true };
  } catch (error) {
    console.log("Delete subject failed: ", error);
    return { success: false };
  }
};
