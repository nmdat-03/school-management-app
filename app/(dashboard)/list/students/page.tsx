import FormContainer from "@/components/FormContainer";
import FilterComponent from "@/components/FilterComponent"
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Class, Grade, Prisma, Student, UserGender } from "@prisma/client";
import {
  ArrowDownWideNarrow,
  ScanSearch,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

/* ================= TYPES ================= */

type StudentList = Student & {
  enrollments: { class: Class & { grade: Grade; } }[];
};

type SearchParams = {
  page?: string;
  classId?: string;
  gradeLevel?: string;
  teacherId?: string;
  gender?: string;
  search?: string;
};

/* ================= PAGE ================= */

const StudentListPage = async ({
  searchParams, }: {
    searchParams: Promise<SearchParams>
  }) => {

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const { page, ...queryParams } = await searchParams;

  const currentPage = page ? Number(page) : 1;

  /* ================= QUERY BUILD ================= */

  const query: Prisma.StudentWhereInput = {
    ...(queryParams.gender && {
      gender: queryParams.gender as UserGender,
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
      ],
    }),

    enrollments: {
      some: {
        ...(queryParams.classId && {
          classId: Number(queryParams.classId),
        }),

        class: {
          ...(queryParams.teacherId && {
            schedules: {
              some: {
                teacherId: queryParams.teacherId,
              },
            },
          }),

          ...(queryParams.gradeLevel && {
            grade: {
              level: Number(queryParams.gradeLevel),
            },
          }),
        },
      },
    },
  };

  /* ================= DATA ================= */
  const [count, data, classes, grades] = await Promise.all([
    prisma.student.count({ where: query }),

    prisma.student.findMany({
      where: query,
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
  ]);

  const relatedData = { classes }

  const totalPages = Math.ceil(count / ITEM_PER_PAGE);

  if (currentPage > totalPages && totalPages > 0) {
    redirect(`?page=${totalPages}`);
  }

  /* ================= TABLE ================= */

  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Student ID",
      accessor: "studentId",
      className: "hidden md:table-cell",
    },
    {
      header: "Gender",
      accessor: "gender",
      className: "hidden md:table-cell",
    },
    {
      header: "Grade",
      accessor: "grade",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
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

  const renderRow = (item: StudentList) => {
    const enrollment = item.enrollments[0];

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-blue-100"
      >
        <td className="flex items-center gap-4 p-4">
          <Image
            src={item.img || "/default-avatar.png"}
            alt=""
            width={40}
            height={40}
            className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
          />

          <div className="flex flex-col">
            <h3 className="font-semibold">
              {item.name} {item.surname}
            </h3>

            <p className="text-xs text-gray-500">
              {enrollment?.class.name}
            </p>
          </div>
        </td>

        <td className="hidden md:table-cell">{item.username}</td>

        <td className="hidden md:table-cell">
          {item.gender?.[0] + item.gender?.slice(1).toLowerCase()}
        </td>

        <td className="hidden md:table-cell">
          {enrollment?.class.grade.level}
        </td>

        <td className="hidden md:table-cell">{item.phone}</td>

        <td>
          <div className="flex items-center gap-2">
            <Link href={`/list/students/${item.id}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-md bg-green-500 text-white">
                <ScanSearch size={16} />
              </button>
            </Link>

            {role === "admin" && (
              <FormContainer table="student" type="delete" id={item.id} />
            )}
          </div>
        </td>
      </tr>
    );
  };

  /* ================= RETURN ================= */

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>
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
                {
                  key: "gender",
                  label: "Gender",
                  options: [
                    { label: "Male", value: "MALE" },
                    { label: "Female", value: "FEMALE" },
                  ],
                },
              ]}
            />
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-200">
              <ArrowDownWideNarrow size={18} />
            </button>
            {role === "admin" && (
              <FormContainer table="student" type="create" relatedData={relatedData} />
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

export default StudentListPage;