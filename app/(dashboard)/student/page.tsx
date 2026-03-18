import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const StudentPage = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const { userId } = await auth();

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: userId!,
    },
    include: {
      class: true,
    },
  });

  const classItem = enrollment?.class;

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md shadow-md">
          <h1 className="text-xl font-semibold">Schedule ({classItem?.name ?? "No Class"})</h1>
          {classItem ? (
            <BigCalendarContainer type="classId" id={classItem.id} />
          ) : (
            <p className="text-gray-500 mt-4">
              You are not assigned to any class yet.
            </p>
          )}
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer searchParams={searchParams} />
        <Announcements />
      </div>
    </div>
  );
};

export default StudentPage;