import FilterComponent from "@/components/FilterComponent";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Assignment, Class, Prisma, Subject, Teacher } from "@prisma/client";
import { ArrowDownWideNarrow } from "lucide-react";
import { redirect } from "next/navigation";

/* ================= TYPES ================= */

type AssignmentList = Assignment & { subject: Subject; class: Class; teacher: Teacher; }

type SearchParams = {
  page?: string;
  classId?: string;
  gradeLevel?: string;
  teacherId?: string;
  search?: string;
};

/* ================= PAGE ================= */

const AssignmentListPage = async ({
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

  const query: Prisma.AssignmentWhereInput = {
    ...(queryParams.classId && {
      classId: Number(queryParams.classId),
    }),

    ...(queryParams.teacherId && {
      teacherId: queryParams.teacherId,
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
          title: {
            contains: queryParams.search,
            mode: "insensitive",
          },
        },
        {
          teacher: {
            is: {
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
        }
      ],
    }),
  };

  /* ================= ROLE CONDITIONS ================= */

  switch (role) {
    case "admin":
      break;

    case "teacher":
      if (currentUserId) {
        query.teacherId = currentUserId;
      };
      break;

    case "student":
      if (currentUserId) {
        query.class = {
          enrollments: {
            some: {
              studentId: currentUserId,
            },
          },
        };
      }
      break;

    case "parent":
      if (currentUserId) {
        query.class = {
          enrollments: {
            some: {
              student: {
                parentId: currentUserId,
              },
            },
          },
        };
      }
      break;

    default:
      break;
  }

  /* ================= DATA & COUNT ================= */

  const [count, data, classes, grades, subjects, teachers, semesters] = await Promise.all([
    prisma.assignment.count({ where: query }),

    prisma.assignment.findMany({
      where: query,
      include: {
        subject: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
        class: { select: { name: true } },
      },
      orderBy: { startDate: "desc" },
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
      orderBy: { name: "asc" },
    }),

    prisma.teacher.findMany({
      include: {
        schedules: {
          select: {
            subjectId: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),

    prisma.semester.findMany({
      orderBy: { startDate: "desc" },
    }),
  ]);

  const relatedData = { classes, grades, subjects, teachers, semesters }


  const totalPages = Math.ceil(count / ITEM_PER_PAGE);

  if (currentPage > totalPages && totalPages > 0) {
    redirect(`?page=${totalPages}`);
  }

  /* ================= TABLE ================= */

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Subject",
      accessor: "subject",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Start Date",
      accessor: "startDate",
      className: "hidden md:table-cell",
    },
    {
      header: "Due Date",
      accessor: "dueDate",
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


  const renderRow = (item: AssignmentList) => {
    const start = new Date(item.startDate);
    const end = new Date(item.dueDate);

    const formatDateTime = (date: Date) =>
      `${date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${date.toLocaleDateString("vi-VN")}`;

    const startFormatted = formatDateTime(start);
    const endFormatted = formatDateTime(end);

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-blue-100"
      >
        <td className="flex items-center gap-4 p-4">
          {item.title}
        </td>

        <td className="hidden md:table-cell">
          {item.subject.name}
        </td>

        <td className="hidden md:table-cell">
          {item.class.name}
        </td>

        <td className="hidden md:table-cell">
          {item.teacher.name + " " + item.teacher.surname}
        </td>

        <td className="hidden md:table-cell">
          {startFormatted}
        </td>

        <td className="hidden md:table-cell">
          {endFormatted}
        </td>

        <td>
          <div className="flex items-center gap-2">
            {(role === "admin" || role === "teacher") && (
              <>
                <FormContainer table="assignment" type="update" data={item} relatedData={relatedData} />
                <FormContainer table="assignment" type="delete" id={item.id} />
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
        <h1 className="hidden md:block text-lg font-semibold">
          All Assignments
        </h1>
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
            {(role === "admin" || role === "teacher") && <FormContainer table="assignment" type="create" relatedData={relatedData} />}
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

export default AssignmentListPage;
