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
import { createEnrollment, updateEnrollment } from "./enroll.action";

/*-------------------------------------------------------*/
/*                    CREATE STUDENT                     */
/*-------------------------------------------------------*/
export async function createStudent(
  data: CreateStudentSchema & {
    classId: number;
    academicYearId: number;
  },
): Promise<ActionResult> {
  try {
    createStudentSchema.parse(data);

    const client = await clerkClient();

    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" },
    });

    const student = await prisma.student.create({
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
        parentId: data.parentId,
      },
    });

    await createEnrollment(
      student.id,
      data.classId,
      data.academicYearId,
    );

    revalidatePath("/students");

    return { success: true };
  } catch (error) {
    console.log("Create student failed:", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                    UPDATE STUDENT                     */
/*-------------------------------------------------------*/
export async function updateStudent(
  data: UpdateStudentSchema & {
    classId: number;
    academicYearId: number;
  },
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
        parentId: data.parentId,
      },
    });

    await updateEnrollment(
      data.id,
      data.classId,
      data.academicYearId,
    );

    revalidatePath("/students");

    return { success: true };
  } catch (error) {
    console.log("Update student failed:", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                    DELETE STUDENT                     */
/*-------------------------------------------------------*/
export const deleteStudent = async (id: string): Promise<ActionResult> => {
  try {
    const client = await clerkClient();

    await prisma.enrollment.deleteMany({
      where: { studentId: id },
    });

    await prisma.student.delete({
      where: { id },
    });

    await client.users.deleteUser(id);

    revalidatePath("/students");

    return { success: true };
  } catch (error) {
    console.log("Delete student failed:", error);
    return { success: false };
  }
};