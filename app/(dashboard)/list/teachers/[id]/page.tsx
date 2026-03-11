import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Subject, Teacher } from "@prisma/client";
import {
  BookOpenCheck,
  BriefcaseBusiness,
  Calendar1,
  CalendarDays,
  ChartColumnBig,
  FileBadge,
  Mail,
  MapPinHouse,
  Phone,
  School,
  Shapes,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SingleTeacherPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {

  const { id } = await params;

  if (!id) {
    return notFound();
  }

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const [subjects, classes, classCount] = await Promise.all([
    prisma.subject.findMany(),
    prisma.class.findMany(),
    prisma.class.count({
      where: {
        schedules: {
          some: {
            teacherId: id,
          },
        },
      },
    }),
  ]);

  const relatedData = { subjects, classes };

  const teacher:
    | (Teacher & {
      subjects: Subject[];
      _count: { subjects: number; schedules: number; classes: number };
    })
    | null = await prisma.teacher.findUnique({
      where: { id },
      include: {
        subjects: true,
        _count: {
          select: {
            subjects: true,
            schedules: true,
            classes: true,
          },
        },
      },
    });

  if (!teacher) {
    return notFound();
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4">
      <div className="flex flex-col xl:flex-row gap-4">
        {/* LEFT */}
        <div className="w-full xl:w-2/3">
          {/* TOP */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* USER INFO CARD */}
            <div className="bg-white p-4 rounded-xl flex-1 flex flex-col md:flex-row gap-6 shadow-md">
              {/* Image */}
              <div className="flex justify-center md:justify-start">
                <Image
                  src={teacher.img || "/default-avatar.png"}
                  alt=""
                  width={144}
                  height={144}
                  className="w-36 h-36 rounded-xl object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col gap-4 items-center md:items-start text-center md:text-left">
                {/* Name */}
                <div className="flex items-center gap-4">
                  <h1 className="text-xl font-semibold"> {teacher.surname + " " + teacher.name}</h1>
                  {role === "admin" && (
                    <FormContainer
                      table="teacher"
                      type="update"
                      data={teacher}
                      relatedData={relatedData}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col md:flex-row gap-6 text-xs w-full">
                  {/* LEFT */}
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      <span className="text-black font-semibold">
                        {new Intl.DateTimeFormat("vi-VN").format(teacher.birthday)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span className="text-black font-semibold">
                        {teacher.phone || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span className="text-black font-semibold">
                        {teacher.email || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinHouse size={16} />
                      <span className="text-black font-semibold">
                        {teacher.address || "-"}
                      </span>
                    </div>
                  </div>
                  {/* RIGHT */}
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <BriefcaseBusiness size={16} />
                      <p className="text-gray-500">
                        Role:{" "}
                        <span className="text-black font-semibold">Teacher</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileBadge size={16} />
                      <p className="text-gray-500">
                        Main Subject:{" "}
                        <span className="text-black font-semibold">
                          {teacher.subjects.length
                            ? teacher.subjects.map((s) => s.name).join(", ")
                            : "No subjects assigned"}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar1 size={16} />
                      <p className="text-gray-500">
                        Joined:{" "}
                        <span className="text-black font-semibold">
                          {new Intl.DateTimeFormat("vi-VN").format(teacher.createdAt)}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChartColumnBig size={16} />
                      <p className="text-gray-500">
                        Status:{" "}
                        <span className="text-black font-semibold">Active</span>
                      </p>
                    </div>
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
              <div>
                <h1 className="text-xl font-semibold">90%</h1>
                <span className="text-sm text-gray-400">Attendance</span>
              </div>
            </div>
            {/* CARD */}
            <div className="relative bg-white p-4 rounded-xl flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-md overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-300 to-blue-400"></div>
              <School />
              <div>
                <h1 className="text-xl font-semibold">{teacher._count.subjects}</h1>
                <span className="text-sm text-gray-400">Subjects</span>
              </div>
            </div>
            {/* CARD */}
            <div className="relative bg-white p-4 rounded-xl flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-md overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-300 to-purple-400"></div>
              <BookOpenCheck />
              <div>
                <h1 className="text-xl font-semibold">{teacher._count.schedules}</h1>
                <span className="text-sm text-gray-400">Schedules</span>
              </div>
            </div>
            {/* CARD */}
            <div className="relative bg-white p-4 rounded-xl flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-md overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-300 to-yellow-400"></div>
              <Shapes />
              <div>
                <h1 className="text-xl font-semibold">{classCount}</h1>
                <span className="text-sm text-gray-400">Classes</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full xl:w-1/3">
          {/* Small cards */}

          {/* Shortcuts */}
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h1 className="text-xl font-semibold">Shortcuts</h1>
            <div className="mt-4 flex gap-4 flex-wrap text-xs text-black">
              <Link
                className="p-3 border border-gray-300 rounded-xl hover:scale-105 hover:shadow-md transition-all duration-300"
                href={`/list/classes?teacherId=${teacher.id}`}
              >
                Teacher&apos;s Classes
              </Link>
              <Link
                className="p-3 border border-gray-300 rounded-xl hover:scale-105 hover:shadow-md transition-all duration-300"
                href={`/list/students?teacherId=${teacher.id}`}
              >
                Teacher&apos;s Students
              </Link>
              <Link
                className="p-3 border border-gray-300 rounded-xl hover:scale-105 hover:shadow-md transition-all duration-300"
                href={`/list/schedules?teacherId=${teacher.id}`}
              >
                Teacher&apos;s Schedules
              </Link>
              <Link
                className="p-3 border border-gray-300 rounded-xl hover:scale-105 hover:shadow-md transition-all duration-300"
                href={`/list/exams?teacherId=${teacher.id}`}
              >
                Teacher&apos;s Exams
              </Link>
              <Link
                className="p-3 border border-gray-300 rounded-xl hover:scale-105 hover:shadow-md transition-all duration-300"
                href={`/list/assignments?teacherId=${teacher.id}`}
              >
                Teacher&apos;s Assignments
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="w-full h-[1270px] p-4 bg-white rounded-xl shadow-md">
        <h1 className="font-semibold mb-4">Teacher&apos;s Schedule</h1>
        <BigCalendarContainer type="teacherId" id={teacher.id} />
      </div>
    </div>
  );
};

export default SingleTeacherPage;
