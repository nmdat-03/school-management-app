import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  BookOpenCheck,
  CalendarClock,
  CalendarDays,
  LibraryBig,
  Mail,
  MapPinHouse,
  Phone,
  School,
  Shapes,
  User,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SingleStudentPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  if (!id) return notFound();

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const [classes, academicYears] = await Promise.all([
    prisma.class.findMany({
      include: {
        grade: true,
      },
    }),
    prisma.academicYear.findMany({
      orderBy: { startDate: "desc" },
    }),
  ]);

  const relatedData = { classes, academicYears };

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          academicYear: true,
          class: {
            include: {
              _count: { select: { schedules: true } },
              supervisor: true,
              grade: true,
            },
          },
        },
        orderBy: {
          academicYear: {
            startDate: "desc",
          },
        },
      },
    },
  });

  if (!student) return notFound();

  const enrollment = student.enrollments[0];
  const studentClass = enrollment?.class;

  return (
    <div className="flex-1 p-4 flex flex-col gap-4">
      <div className="flex flex-col xl:flex-row gap-4">
        {/* LEFT */}
        <div className="w-full xl:w-2/3">
          {/* USER INFO */}
          <div className="bg-white p-4 rounded-xl flex flex-col md:flex-row gap-6 shadow-md">
            <div className="flex justify-center md:justify-start">
              <Image
                src={student.img || "/default-avatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-xl object-cover"
              />
            </div>

            <div className="flex-1 flex flex-col gap-4 items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {student.name} {student.surname}
                </h1>

                {role === "admin" && (
                  <FormContainer
                    table="student"
                    type="update"
                    data={student}
                    relatedData={relatedData}
                  />
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-6 text-xs w-full">
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    <span className="font-semibold">
                      {new Intl.DateTimeFormat("vi-VN").format(student.birthday)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span className="font-semibold">{student.phone || "-"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span className="font-semibold">{student.email || "-"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPinHouse size={16} />
                    <span className="font-semibold">{student.address || "-"}</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <School size={16} />
                    <p>
                      Grade:{" "}
                      <span className="font-semibold">
                        {studentClass?.grade?.level ? `${studentClass.grade.level}th` : "-"}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <LibraryBig size={16} />
                    <p>
                      Class:{" "}
                      <span className="font-semibold">
                        {studentClass?.name ?? "-"}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <p>
                      Advisor:{" "}
                      <span className="font-semibold">
                        {studentClass?.supervisor
                          ? `${studentClass.supervisor.name} ${studentClass.supervisor.surname}`
                          : "-"}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarClock size={16} />
                    <p>
                      Academic Year:{" "}
                      <span className="font-semibold">
                        {enrollment?.academicYear?.name ?? "-"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Small Cards */}
          <div className="flex gap-4 mt-4">
            {/* CARD */}
            <div className="relative bg-white p-4 rounded-xl flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-md overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-green-300 to-green-400"></div>
              <UserCheck />
              <StudentAttendanceCard id={student.id} />
            </div>
            {/* CARD */}
            <div className="relative bg-white p-4 rounded-xl flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-md overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-300 to-blue-400"></div>
              <School />
              <div>
                <h1 className="text-xl font-semibold">{studentClass?.grade?.level ? `${studentClass.grade.level}th` : "-"}</h1>
                <span className="text-sm text-gray-400">Grade</span>
              </div>
            </div>
            {/* CARD */}
            <div className="relative bg-white p-4 rounded-xl flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-md overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-300 to-purple-400"></div>
              <BookOpenCheck />
              <div>
                <h1 className="text-xl font-semibold">{studentClass?._count?.schedules ?? "-"}</h1>
                <span className="text-sm text-gray-400">Schedules</span>
              </div>
            </div>
            {/* CARD */}
            <div className="relative bg-white p-4 rounded-xl flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-md overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-300 to-yellow-400"></div>
              <Shapes />
              <div>
                <h1 className="text-xl font-semibold">{studentClass?.name ?? "-"}</h1>
                <span className="text-sm text-gray-400">Class</span>
              </div>
            </div>
          </div>

          {/* ENROLLMENTS */}
          <div className="bg-white p-4 rounded-xl shadow-md mt-4">
            <div className="flex items-center justify-between">
              <h1 className="font-semibold text-lg">Enrollments</h1>

              {role === "admin" && (
                <FormContainer
                  table="enrollment"
                  type="create"
                  data={{ studentId: student.id }}
                  relatedData={relatedData}
                />
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {student.enrollments.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{e.class.name}</p>
                    <p className="text-xs text-gray-500">
                      {e.academicYear.name}
                    </p>
                  </div>

                  {role === "admin" && (
                    <FormContainer
                      table="enrollment"
                      type="update"
                      data={{
                        studentId: e.studentId,
                        classId: e.classId,
                        academicYearId: e.academicYearId,
                      }}
                      relatedData={relatedData}
                    />
                  )}
                </div>
              ))}
            </div>


          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full xl:w-1/3">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h1 className="text-xl font-semibold">Shortcuts</h1>
            <div className="mt-4 flex gap-4 flex-wrap text-xs">
              {studentClass ? (
                <>
                  <Link
                    className="p-3 border rounded-xl"
                    href={`/list/schedules?classId=${studentClass.id}`}
                  >
                    Student&apos;s Schedules
                  </Link>

                  <Link
                    className="p-3 border rounded-xl"
                    href={`/list/teachers?classId=${studentClass.id}`}
                  >
                    Student&apos;s Teachers
                  </Link>

                  <Link
                    className="p-3 border rounded-xl"
                    href={`/list/exams?classId=${studentClass.id}`}
                  >
                    Student&apos;s Exams
                  </Link>

                  <Link
                    className="p-3 border rounded-xl"
                    href={`/list/assignments?classId=${studentClass.id}`}
                  >
                    Student&apos;s Assignments
                  </Link>
                </>
              ) : (
                <p className="text-sm text-gray-400">
                  Student has not been assigned to a class yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CALENDAR */}
      <div className="w-full h-[1270px] p-4 bg-white rounded-xl shadow-md">
        <h1 className="font-semibold mb-4">Student&apos;s Schedule</h1>

        {studentClass ? (
          <BigCalendarContainer type="classId" id={studentClass.id} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            This student is not enrolled in any class yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleStudentPage;