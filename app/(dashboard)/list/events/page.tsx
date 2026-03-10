import FilterComponent from "@/components/FilterComponent";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Class, Event, Prisma } from "@prisma/client";
import { ArrowDownWideNarrow } from "lucide-react";
import { redirect } from "next/navigation";

/* ================= TYPES ================= */

type EventList = Event & { class: Class | null };

type SearchParams = {
  page?: string;
  classId?: string;
  gradeLevel?: string;
  search?: string;
};

/* ================= PAGE ================= */

const EventListPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const { page, ...queryParams } = await searchParams;

  const currentPage = page ? Number(page) : 1;

  /* ================= QUERY BUILD ================= */

  const query: Prisma.EventWhereInput = {
    ...(queryParams.classId && {
      classId: Number(queryParams.classId),
    }),

    ...(queryParams.gradeLevel && {
      class: {
        grade: {
          level: Number(queryParams.gradeLevel),
        },
      },
    }),

    ...(queryParams.search && {
      title: {
        contains: queryParams.search,
        mode: "insensitive",
      },
    }),
  };

  /* ================= ROLE CONDITIONS ================= */

  switch (role) {
    case "admin":
      break;

    case "teacher":
      query.class = {
        schedules: {
          some: {
            teacherId: currentUserId!,
          },
        },
      };
      break;

    case "student":
      query.class = {
        enrollments: {
          some: {
            studentId: currentUserId!,
          },
        },
      };
      break;

    case "parent":
      query.class = {
        enrollments: {
          some: {
            student: {
              parentId: currentUserId!,
            },
          },
        },
      };
      break;

    default:
      break;
  }

  /* ================= DATA & COUNT ================= */

  const [count, data, classes, grades] = await Promise.all([
    prisma.event.count({ where: query, }),

    prisma.event.findMany({
      where: query,
      include: {
        class: true,
      },
      orderBy: {
        startTime: "desc",
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (currentPage - 1),
    }),

    prisma.class.findMany({
      include: { grade: true },
      orderBy: { name: "asc" },
    }),

    prisma.grade.findMany({
      orderBy: { level: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(count / ITEM_PER_PAGE);

  if (totalPages > 0 && currentPage > totalPages) {
    redirect(`?page=${totalPages}`);
  }

  /* ================= TABLE ================= */

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Class",
      accessor: "class",
      className: "hidden md:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    {
      header: "Time",
      accessor: "time",
      className: "hidden md:table-cell",
    },
    ...(role === "admin"
      ? [
        {
          header: "Actions",
          accessor: "action",
        },
      ]
      : []),
  ];

  const renderRow = (item: EventList) => {
    const start = new Date(item.startTime);
    const end = new Date(item.endTime);

    const formatTime = (date: Date) =>
      date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

    const date = start.toLocaleDateString("vi-VN");

    const startTime = formatTime(start);
    const endTime = formatTime(end);

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-blue-100"
      >
        <td className="flex items-center gap-4 p-4">{item.title}</td>

        <td className="hidden md:table-cell">{item.class?.name || "-"}</td>

        <td className="hidden md:table-cell">
          {date}
        </td>

        <td className="hidden md:table-cell">
          {startTime} - {endTime}
        </td>

        <td>
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormContainer table="event" type="update" data={item} />
                <FormContainer table="event" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      </tr>
    )
  };

  /* ================= RETURN ================= */

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Events</h1>

        <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-4">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <FilterComponent
              fields={[
                {
                  key: "gradeLevel",
                  label: "Grade",
                  options: grades.map((g) => ({
                    label: `Grade ${g.level}`,
                    value: g.level.toString(),
                  })),
                },
                {
                  key: "classId",
                  label: "Class",
                  options: classes.map((c) => ({
                    label: c.name,
                    value: c.id.toString(),
                    gradeLevel: c.grade.level,
                  })),
                },
              ]}
            />

            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-200">
              <ArrowDownWideNarrow size={18} />
            </button>

            {role === "admin" && (
              <FormContainer table="event" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={currentPage} count={count} />
    </div>
  );
};

export default EventListPage;