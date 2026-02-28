import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const Announcements = async () => {

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const roleConditions = {
    teacher: { schedules: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } },
    parent: { students: { some: { parentId: userId! } } },
  };

  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: { date: "desc" },
    where: {
      ...(role !== "admin" && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
    },
  });

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <Link href="/list/announcements">
          <span className="text-xs text-gray-500 hover:text-sky-500 hover:underline cursor-pointer">View All</span>
        </Link>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {data[0] && (
          <div className="bg-blue-100 rounded-md p-4">
            <div className="flex flex-col gap-1">
              <span className="inline-flex self-end text-xs text-black bg-white rounded-md px-2 py-1">
                {new Intl.DateTimeFormat("vi-VN").format(data[0].date)}
              </span>
              <h2 className="font-medium">{data[0].title}</h2>
              <p className="text-sm text-gray-500">{data[0].description}</p>
            </div>
          </div>
        )}
        {data[1] && (
          <div className="bg-purple-100 rounded-md p-4">
            <div className="flex flex-col gap-1">
              <span className="inline-flex self-end text-xs text-black bg-white rounded-md px-2 py-1">
                {new Intl.DateTimeFormat("vi-VN").format(data[1].date)}
              </span>
              <h2 className="font-medium">{data[1].title}</h2>
              <p className="text-sm text-gray-500">{data[1].description}</p>
            </div>
          </div>
        )}
        {data[2] && (
          <div className="bg-green-100 rounded-md p-4">
            <div className="flex flex-col gap-1">
              <span className="inline-flex self-end text-xs text-black bg-white rounded-md px-2 py-1">
                {new Intl.DateTimeFormat("vi-VN").format(data[2].date)}
              </span>
              <h2 className="font-medium">{data[2].title}</h2>
              <p className="text-sm text-gray-500">{data[2].description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
