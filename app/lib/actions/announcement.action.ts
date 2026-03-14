"use server";

import { ActionResult } from "@/components/FormModal";
import {
  AnnouncementSchema,
  announcementSchema,
} from "../formValidationSchemas";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

/*-------------------------------------------------------*/
/*                CREATE ANNOUNCEMENT                    */
/*-------------------------------------------------------*/
export async function createAnnouncement(
  data: AnnouncementSchema,
): Promise<ActionResult> {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin") {
      throw new Error("Unauthorized");
    }

    announcementSchema.parse(data);

    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId ?? null,
      },
    });

    revalidatePath("/announcements");

    return { success: true };
  } catch (error) {
    console.log("Create announcement failed:", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                UPDATE ANNOUNCEMENT                    */
/*-------------------------------------------------------*/
export async function updateAnnouncement(
  data: AnnouncementSchema,
): Promise<ActionResult> {
  try {
    if (!data.id) throw new Error("Missing announcement id");

    announcementSchema.parse(data);

    await prisma.announcement.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId ?? null,
      },
    });

    revalidatePath("/announcements");

    return { success: true };
  } catch (error) {
    console.log("Update announcement failed:", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                DELETE ANNOUNCEMENT                    */
/*-------------------------------------------------------*/
export const deleteAnnouncement = async (id: number): Promise<ActionResult> => {
  try {
    await prisma.announcement.delete({
      where: { id },
    });

    revalidatePath("/announcements");

    return { success: true };
  } catch (error) {
    console.log("Delete announcement failed:", error);
    return { success: false };
  }
};
