import { TableType } from "@/lib/form"
import { auth } from "@clerk/nextjs/server";
import FormModal from "./FormModal";
import prisma from "@/lib/prisma";

interface FormContainerProps {
  table: TableType;
  type: "create" | "update" | "delete";
  data?: unknown;
  id?: number | string;
  relatedData?: unknown;
}

const FormContainer = async ({
  table,
  type,
  data,
  id,
}: FormContainerProps) => {

  let relatedData = {};

  const { userId, sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role
  const currentUserId = userId

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;

      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;

      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;

      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        const parents = await prisma.parent.findMany({
          select: { id: true, name: true, surname: true, phone: true, },
        });
        relatedData = { classes: studentClasses, grades: studentGrades, parents };
        break;

      case "parent":
        relatedData = {};
        break;

      case "exam":
        const examSchedules = await prisma.schedule.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true },
        });
        relatedData = { schedules: examSchedules };
        break;

      case "schedule":
        const scheduleClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        const scheduleSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        const scheduleTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true, subjects: { select: { id: true } } },
        });
        relatedData = { classes: scheduleClasses, subjects: scheduleSubjects, teachers: scheduleTeachers, };
        break;

      default:
        break;
    }
  }

  return (
    <div>
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData} />
    </div>
  )
}

export default FormContainer