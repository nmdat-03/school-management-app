"use server";

import { ActionResult } from "@/components/FormModal";
import { EventSchema, eventSchema } from "../formValidationSchemas";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

/*-------------------------------------------------------*/
/*                    CREATE EVENT                       */
/*-------------------------------------------------------*/
export async function createEvent(data: EventSchema): Promise<ActionResult> {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin") {
      throw new Error("Unauthorized");
    }

    eventSchema.parse(data);

    if (data.startTime >= data.endTime) {
      throw new Error("Invalid event time");
    }

    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId ?? null,
      },
    });

    revalidatePath("/events");

    return { success: true };
  } catch (error) {
    console.log("Create event failed:", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                    UPDATE EVENT                       */
/*-------------------------------------------------------*/
export async function updateEvent(data: EventSchema): Promise<ActionResult> {
  try {
    if (!data.id) throw new Error("Missing event id");

    eventSchema.parse(data);

    if (data.startTime >= data.endTime) {
      throw new Error("Invalid event time");
    }

    await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId ?? null,
      },
    });

    revalidatePath("/events");

    return { success: true };
  } catch (error) {
    console.log("Update event failed:", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                    DELETE EVENT                       */
/*-------------------------------------------------------*/
export const deleteEvent = async (id: number): Promise<ActionResult> => {
  try {
    await prisma.event.delete({
      where: { id },
    });

    revalidatePath("/events");

    return { success: true };
  } catch (error) {
    console.log("Delete event failed:", error);
    return { success: false };
  }
};
