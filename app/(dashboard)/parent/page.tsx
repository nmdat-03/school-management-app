import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const ParentPage = async () => {
  const { userId } = await auth();

  const students = await prisma.student.findMany({
    where: {
      parentId: userId!,
    },
    include: {
      enrollments: {
        include: {
          class: true,
        },
        take: 1,
      },
    },
  });

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        {students.map((student) => {
          const enrollment = student.enrollments[0];
          const classItem = enrollment?.class;

          return (
            <div
              key={student.id}
              className="bg-white p-4 rounded-md shadow-md"
            >
              <h1 className="text-xl font-semibold">
                Schedule ({student.name} {student.surname})
              </h1>

              {classItem ? (
                <BigCalendarContainer
                  type="classId"
                  id={classItem.id}
                />
              ) : (
                <p className="text-gray-500 mt-4">
                  This student is not assigned to any class yet.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default ParentPage;