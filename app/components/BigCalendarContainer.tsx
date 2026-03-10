import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalendar";

type Props = {
  type: "teacherId" | "classId";
  id: string | number;
};

const BigCalendarContainer = async ({ type, id }: Props) => {
  /* ----------------------------------------------------- */
  /*                    WEEKLY SCHEDULE                    */
  /* ----------------------------------------------------- */

  const schedules = await prisma.schedule.findMany({
    where: {
      ...(type === "teacherId"
        ? { teacherId: String(id) }
        : { classId: Number(id) }),
    },
    include: { subject: true, class: true },
  });

  /* ----------------------------------------------------- */
  /*                         EXAMS                         */
  /* ----------------------------------------------------- */

  const exams = await prisma.exam.findMany({
    where: {


      ...(type === "teacherId"
        ? { teacherId: String(id) }
        : { classId: Number(id) }),


    },
  });

  /* ----------------------------------------------------- */
  /*                     ASSIGNMENTS                       */
  /* ----------------------------------------------------- */

  const assignments = await prisma.assignment.findMany({
    where: {


      ...(type === "teacherId"
        ? { teacherId: String(id) }
        : { classId: Number(id) }),


    },
  });

  return (
    <BigCalendar
      type={type}
      schedules={schedules}
      exams={exams}
      assignments={assignments}
    />
  );
};

export default BigCalendarContainer;