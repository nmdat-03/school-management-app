"use server";

import { clerkClient } from "@clerk/nextjs/server";
import {
  createTeacherSchema,
  CreateTeacherSchema,
  updateTeacherSchema,
  UpdateTeacherSchema,
} from "../formValidationSchemas";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/components/FormModal";

/*-------------------------------------------------------*/
/*                    CREATE TEACHER                     */
/*-------------------------------------------------------*/
export async function createTeacher(
  data: CreateTeacherSchema,
): Promise<ActionResult> {
  try {
    createTeacherSchema.parse(data);

    const client = await clerkClient();

    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher" },
    });

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        gender: data.gender,
        birthday: data.birthday,
        img: data.img || null,
        subjects: {
          connect: data.subjects?.map((id) => ({ id })),
        },
      },
    });

    revalidatePath("/teachers");
    return { success: true };
  } catch (error) {
    console.log("Create teacher failed: ", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                    UPDATE TEACHER                     */
/*-------------------------------------------------------*/
export async function updateTeacher(
  data: UpdateTeacherSchema,
  options?: { updateSubjects?: boolean },
): Promise<ActionResult> {
  try {
    if (!data.id) throw new Error("Missing teacher id");

    updateTeacherSchema.parse(data);

    const client = await clerkClient();

    await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        gender: data.gender,
        birthday: data.birthday,
        img: data.img || null,
        ...(options?.updateSubjects && {
          subjects: {
            set: data.subjects?.map((id) => ({ id })),
          },
        }),
      },
    });

    revalidatePath("/teachers");
    return { success: true };
  } catch (error) {
    console.log("Update teacher failed: ", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                    DELETE TEACHER                     */
/*-------------------------------------------------------*/
export const deleteTeacher = async (id: string): Promise<ActionResult> => {
  try {
    const client = await clerkClient();

    await prisma.teacher.delete({ where: { id } });
    await client.users.deleteUser(id);

    revalidatePath("/teachers");
    return { success: true };
  } catch (error) {
    console.log("Delete teacher failed:", error);
    return { success: false };
  }
};
