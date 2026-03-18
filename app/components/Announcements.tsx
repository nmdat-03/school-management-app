import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const Announcements = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const roleConditions = {
    teacher: {
      schedules: {
        some: { teacherId: userId! },
      },
    },

    parent: {
      enrollments: {
        some: {
          student: {
            parentId: userId!,
          },
        },
      },
    },
  };

  // Optimization for student
  let classId: number | null = null;

  if (role === "student") {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: userId!,
        academicYear: {
          isActive: true,
        },
      },
    });

    classId = enrollment?.classId ?? null;
  }

  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: { date: "desc" },
    where:
      role === "admin"
        ? {}
        : role === "student"
          ? {
            OR: [{ classId: null }, { classId }],
          }
          : {
            OR: [
              { classId: null },
              { class: roleConditions[role as keyof typeof roleConditions] },
            ],
          },
  });

  const colors = ["bg-blue-100", "bg-purple-100", "bg-green-100"];

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <Link href="/list/announcements">
          <span className="text-xs text-gray-500 hover:text-sky-500 hover:underline cursor-pointer">
            View All
          </span>
        </Link>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {data.length === 0 ? (
          <div className="text-sm text-gray-400 italic text-center py-6">
            No announcements at the moment
          </div>
        ) : (
          data.map((item, index) => (
            <div
              key={item.id}
              className={`${colors[index % colors.length]} rounded-md p-4`}
            >
              <div className="flex flex-col gap-1">
                <span className="inline-flex self-end text-xs text-black bg-white rounded-md px-2 py-1">
                  {new Intl.DateTimeFormat("vi-VN").format(item.date)}
                </span>

                <h2 className="font-medium">{item.title}</h2>

                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;