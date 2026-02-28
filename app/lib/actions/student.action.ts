"use server";

import { clerkClient } from "@clerk/nextjs/server";
import {
  createStudentSchema,
  CreateStudentSchema,
  updateStudentSchema,
  UpdateStudentSchema,
} from "../formValidationSchemas";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/components/FormModal";

/*-------------------------------------------------------*/
/*                    CREATE STUDENT                     */
/*-------------------------------------------------------*/
export async function createStudent(
  data: CreateStudentSchema,
): Promise<ActionResult> {
  try {
    createStudentSchema.parse(data);

    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      throw new Error("Class is full");
    }

    const client = await clerkClient();

    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" },
    });

    await prisma.student.create({
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
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    revalidatePath("/students");
    return { success: true };
  } catch (error) {
    console.log("Create student failed: ", error);
    return { success: false };
    throw error;
  }
}

/*-------------------------------------------------------*/
/*                    UPDATE STUDENT                     */
/*-------------------------------------------------------*/
export async function updateStudent(
  data: UpdateStudentSchema,
): Promise<ActionResult> {
  try {
    if (!data.id) throw new Error("Missing student id");

    updateStudentSchema.parse(data);

    const client = await clerkClient();

    await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
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
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    revalidatePath("/students");
    return { success: true };
  } catch (error) {
    console.log("Update student failed: ", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                    DELETE STUDENT                     */
/*-------------------------------------------------------*/
export const deleteStudent = async (id: string): Promise<ActionResult> => {
  try {
    const client = await clerkClient();

    await prisma.student.delete({ where: { id } });
    await client.users.deleteUser(id);

    revalidatePath("/students");
    return { success: true };
  } catch (error) {
    console.log("Delete student failed:", error);
    return { success: false };
  }
};
