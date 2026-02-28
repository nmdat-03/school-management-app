"use server";

import { clerkClient } from "@clerk/nextjs/server";
import {
  createParentSchema,
  CreateParentSchema,
  updateParentSchema,
  UpdateParentSchema,
} from "../formValidationSchemas";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/components/FormModal";

/*-------------------------------------------------------*/
/*                    CREATE PARENT                      */
/*-------------------------------------------------------*/
export async function createParent(
  data: CreateParentSchema
): Promise<ActionResult> {
  try {
    createParentSchema.parse(data);

    const client = await clerkClient();

    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "parent" },
    });

    await prisma.parent.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    revalidatePath("/parents");

    return { success: true };
  } catch (error) {
    console.log("Create parent failed:", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                    UPDATE PARENT                      */
/*-------------------------------------------------------*/
export async function updateParent(
  data: UpdateParentSchema
): Promise<ActionResult> {
  try {
    if (!data.id) throw new Error("Missing parent id");

    updateParentSchema.parse(data);

    const client = await clerkClient();

    await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.parent.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    revalidatePath("/parents");

    return { success: true };
  } catch (error) {
    console.log("Update parent failed:", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                    DELETE PARENT                      */
/*-------------------------------------------------------*/
export async function deleteParent(
  id: string
): Promise<ActionResult> {
  try {
    const client = await clerkClient();

    await prisma.parent.delete({
      where: { id },
    });

    await client.users.deleteUser(id);

    revalidatePath("/parents");

    return { success: true };
  } catch (error) {
    console.log("Delete parent failed:", error);
    return { success: false };
  }
}