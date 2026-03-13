import FilterComponent from "@/components/FilterComponent";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Class, Schedule, Prisma, Subject, Teacher } from "@prisma/client";
import { ArrowDownWideNarrow } from "lucide-react";
import { redirect } from "next/navigation";

/* ================= TYPES ================= */

type ScheduleList = Schedule & { subject: Subject } & { class: Class } & { teacher: Teacher }

type SearchParams = {
  page?: string;
  classId?: string;
  gradeLevel?: string;
  search?: string;
};

/* ================= PAGE ================= */

const ScheduleListPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const { page, ...queryParams } = await searchParams;

  const currentPage = page ? Number(page) : 1;

  /* ================= QUERY BUILD ================= */

  const query: Prisma.ScheduleWhereInput = {
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
      OR: [
        {
          subject: {
            name: {
              contains: queryParams.search,
              mode: "insensitive",
            },
          },
        },
        {
          teacher: {
            OR: [
              {
                name: {
                  contains: queryParams.search,
                  mode: "insensitive",
                },
              },
              {
                surname: {
                  contains: queryParams.search,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      ],
    }),
  };

  /* ================= DATA ================= */

  const [count, data, classes, grades, subjects, teachers] = await Promise.all([
    prisma.schedule.count({ where: query }),

    prisma.schedule.findMany({
      where: query,
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true, grade: true } },
        teacher: { select: { name: true, surname: true } },
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

    prisma.subject.findMany({
      select: { id: true, name: true }
    }),

    prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
        surname: true,
        subjects: {
          select: { id: true }
        }
      }
    })
  ])

  const relatedData = { classes, grades, subjects, teachers }

  /* ================= COUNT ================= */

  const totalPages = Math.ceil(count / ITEM_PER_PAGE);

  if (currentPage > totalPages && totalPages > 0) {
    redirect(`?page=${totalPages}`);
  }

  /* ================= TABLE ================= */

  const columns = [
    {
      header: "Subject",
      accessor: "subject",
    },
    {
      header: "Class",
      accessor: "class",
      className: "hidden md:table-cell",
    },
    {
      header: "Day",
      accessor: "day",
      className: "hidden md:table-cell",
    },
    {
      header: "Start Time",
      accessor: "startTime",
      className: "hidden md:table-cell",
    },
    {
      header: "End Time",
      accessor: "endTime",
      className: "hidden md:table-cell",
    },
    {
      header: "Teacher",
      accessor: "teacher",
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

  const renderRow = (item: ScheduleList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-blue-100"
    >
      <td className="flex items-center gap-4 p-4">{item.subject.name}</td>
      <td className="hidden md:table-cell">{item.class.name}</td>
      <td className="hidden md:table-cell">{item.day?.[0] + item.day?.slice(1).toLowerCase()}</td>
      <td className="hidden md:table-cell">{item.startTime}</td>
      <td className="hidden md:table-cell">{item.endTime}</td>
      <td className="hidden md:table-cell">{item.teacher.name + " " + item.teacher.surname}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="schedule" type="update" data={item} relatedData={relatedData} />
              <FormContainer table="schedule" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  /* ================= RETURN ================= */

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Schedules</h1>
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
            {role === "admin" && <FormContainer table="schedule" type="create" relatedData={relatedData} />}
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

export default ScheduleListPage;
