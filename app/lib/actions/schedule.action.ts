"use server";

import { ActionResult } from "@/components/FormModal";
import { ScheduleSchema, scheduleSchema } from "../formValidationSchemas";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";

/*-------------------------------------------------------*/
/*                    CREATE SCHEDULE                    */
/*-------------------------------------------------------*/
export async function createSchedule(data: ScheduleSchema): Promise<ActionResult> {
  try {
    const validatedData = scheduleSchema.parse(data);

    /* CHECK CLASS TIME CONFLICT */
    const classConflict = await prisma.schedule.findFirst({
      where: {
        classId: validatedData.classId,
        day: validatedData.day,
        startTime: { lt: validatedData.endTime },
        endTime: { gt: validatedData.startTime },
      },
    });

    if (classConflict) {
      return {
        success: false,
        error: "Class already has a schedule at this time.",
      };
    }

    /* CHECK TEACHER TIME CONFLICT */
    const teacherConflict = await prisma.schedule.findFirst({
      where: {
        teacherId: validatedData.teacherId,
        day: validatedData.day,
        startTime: { lt: validatedData.endTime },
        endTime: { gt: validatedData.startTime },
      },
    });

    if (teacherConflict) {
      return {
        success: false,
        error: "Teacher already has a schedule at this time.",
      };
    }

    await prisma.schedule.create({
      data: validatedData,
    });

    revalidatePath("/schedules");
    return { success: true };
  } catch (error) {
    console.log("Create schedule failed: ", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                    UPDATE SCHEDULE                    */
/*-------------------------------------------------------*/
export async function updateSchedule(data: ScheduleSchema): Promise<ActionResult> {
  try {
    if (!data.id) throw new Error("Missing schedule id");

    const validatedData = scheduleSchema.parse(data);

    /* CHECK CLASS TIME CONFLICT */
    const classConflict = await prisma.schedule.findFirst({
      where: {
        id: { not: validatedData.id },
        classId: validatedData.classId,
        day: validatedData.day,
        startTime: { lt: validatedData.endTime },
        endTime: { gt: validatedData.startTime },
      },
    });

    if (classConflict) {
      return {
        success: false,
        error: "Class already has a schedule at this time.",
      };
    }

    /* CHECK TEACHER TIME CONFLICT */
    const teacherConflict = await prisma.schedule.findFirst({
      where: {
        id: { not: validatedData.id },
        teacherId: validatedData.teacherId,
        day: validatedData.day,
        startTime: { lt: validatedData.endTime },
        endTime: { gt: validatedData.startTime },
      },
    });

    if (teacherConflict) {
      return {
        success: false,
        error: "Teacher already has a schedule at this time.",
      };
    }

    await prisma.schedule.update({
      where: { id: validatedData.id },
      data: validatedData,
    });

    revalidatePath("/schedules");
    return { success: true };
  } catch (error) {
    console.log("Update schedule failed: ", error);
    return { success: false };
  }
}

/*-------------------------------------------------------*/
/*                    DELETE SCHEDULE                      */
/*-------------------------------------------------------*/
export const deleteSchedule = async (id: number): Promise<ActionResult> => {
  try {
    await prisma.schedule.delete({
      where: { id },
    });

    revalidatePath("/schedules");

    return { success: true };
  } catch (error) {
    console.log("Delete schedule failed: ", error);
    return { success: false };
  }
};
