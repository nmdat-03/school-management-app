import FilterComponent from "@/components/FilterComponent";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Class, Grade, Parent, Prisma, Student } from "@prisma/client";
import { ArrowDownWideNarrow } from "lucide-react";
import { redirect } from "next/navigation";

/* ================= TYPES ================= */

type ParentList = Parent & {
  students: (Student & { enrollments: { class: Class & { grade: Grade } }[] })[];
};

type SearchParams = {
  page?: string;
  classId?: string;
  gradeLevel?: string;
  search?: string;
};

/* ================= PAGE ================= */

const ParentListPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) => {

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const { page, ...queryParams } = await searchParams;

  const currentPage = page ? parseInt(page) : 1;

  /* ================= QUERY BUILD ================= */

  const query: Prisma.ParentWhereInput = {
    ...((queryParams.classId || queryParams.gradeLevel || role === "teacher") && {
      students: {
        some: {
          enrollments: {
            some: {
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

              ...(role === "teacher" && {
                class: {
                  schedules: {
                    some: {
                      teacherId: currentUserId!,
                    },
                  },
                },
              }),
            },
          },
        },
      },
    }),

    ...(queryParams.search && {
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
        {
          email: {
            contains: queryParams.search,
            mode: "insensitive",
          },
        },
        {
          students: {
            some: {
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
        },
      ],
    }),
  };

  /* ================= DATA ================= */

  const [count, data, classes, grades] = await Promise.all([
    prisma.parent.count({ where: query }),

    prisma.parent.findMany({
      where: query,
      include: {
        students: {
          include: {
            enrollments: {
              include: {
                class: {
                  include: {
                    grade: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (currentPage - 1),
    }),

    prisma.class.findMany({
      include: { grade: true },
      orderBy: { name: "asc" },
    }),

    prisma.grade.findMany({
      orderBy: { level: "asc" },
    })
  ])

  const totalPages = Math.ceil(count / ITEM_PER_PAGE);

  if (currentPage > totalPages && totalPages > 0) {
    redirect(`?page=${totalPages}`);
  }

  /* ================= TABLE ================= */

  const columns = [
    {
      header: "Info",
      accessor: "info",
      className: "w-68"
    },
    {
      header: "Student Names",
      accessor: "students",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin"
      ? [
        {
          header: "Actions",
          accessor: "action",
          className: "w-20"
        },
      ]
      : []),
  ];

  const renderRow = (item: ParentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-blue-100"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name + " " + item.surname}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">
        <div className="flex flex-col">
          {item.students.length ? (
            item.students.map((student) =>
              student.enrollments.length > 0 ? (
                student.enrollments.map((e) => (
                  <span key={`${student.id}-${e.class.id}`}>
                    {student.surname} {student.name} ({e.class.name})
                  </span>
                ))
              ) : (
                <span key={student.id}>
                  {student.surname} {student.name} (No class)
                </span>
              )
            )
          ) : (
            <span>-</span>
          )}
        </div>
      </td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell max-w-[150px] break-words py-2 pr-6">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="parent" type="update" data={item} />
              <FormContainer table="parent" type="delete" id={item.id} />
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
        <h1 className="hidden md:block text-lg font-semibold">All Parents</h1>
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
            {role === "admin" && <FormContainer table="parent" type="create" />}
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

export default ParentListPage;
