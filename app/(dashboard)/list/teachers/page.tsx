import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Class, UserGender, Prisma, Subject, Teacher } from "@prisma/client";
import {
  ArrowDownWideNarrow,
  ScanSearch,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import FilterComponent from "@/components/FilterComponent";

/* ================= TYPES ================= */

type TeacherList = Teacher & {
  subjects: Subject[];
  schedules: {
    class: Class;
  }[];
};

type SearchParams = {
  page?: string;
  classId?: string;
  gradeLevel?: string;
  subjectId?: string;
  gender?: string;
  search?: string;
};

/* ================= PAGE ================= */

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const { page, ...queryParams } = await searchParams;

  const currentPage = page ? Number(page) : 1;

  /* ================= QUERY BUILD ================= */

  const query: Prisma.TeacherWhereInput = {};

  if (queryParams.gradeLevel || queryParams.classId) {
    query.schedules = {
      some: {
        class: {
          ...(queryParams.classId && {
            id: Number(queryParams.classId),
          }),
          ...(queryParams.gradeLevel && {
            grade: {
              level: Number(queryParams.gradeLevel),
            },
          }),
        },
      },
    };
  }

  if (queryParams.subjectId) {
    query.subjects = {
      some: {
        id: Number(queryParams.subjectId),
      },
    };
  }

  if (queryParams.gender) {
    query.gender = queryParams.gender as UserGender;
  }

  if (queryParams.search) {
    query.OR = [
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
    ];
  }

  /* ================= DATA ================= */

  const [count, data, classes, grades, subjects] = await Promise.all([
    prisma.teacher.count({ where: query }),

    prisma.teacher.findMany({
      where: query,
      include: {
        subjects: true,
        schedules: {
          include: {
            class: true,
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
    }),

    prisma.subject.findMany(),
  ]);

  const relatedData = { classes, subjects }

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
      header: "Teacher ID",
      accessor: "teacherId",
      className: "hidden md:table-cell",
    },
    {
      header: "Gender",
      accessor: "gender",
      className: "hidden md:table-cell",
    },
    {
      header: "Subjects",
      accessor: "subjects",
      className: "hidden md:table-cell",
    },
    {
      header: "Classes",
      accessor: "classes",
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

  const renderRow = (item: TeacherList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-blue-50"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/default-avatar.png"}
          alt="teacher"
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">
            {item.surname} {item.name}
          </h3>
          <p className="text-xs text-gray-500">{item.email}</p>
        </div>
      </td>

      <td className="hidden md:table-cell">{item.username}</td>

      <td className="hidden md:table-cell">
        {item.gender.charAt(0) +
          item.gender.slice(1).toLowerCase()}
      </td>

      <td className="hidden md:table-cell">
        {item.subjects.map((s) => s.name).join(", ")}
      </td>

      <td className="hidden md:table-cell">
        {item.schedules.length
          ? [...new Set(item.schedules.map((s) => s.class.name))].join(", ")
          : "-"}
      </td>

      <td className="hidden lg:table-cell">{item.phone}</td>

      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-md bg-green-500 text-white">
              <ScanSearch size={16} />
            </button>
          </Link>

          {role === "admin" && (
            <FormContainer table="teacher" type="delete" id={item.id} />
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
        <h1 className="hidden md:block text-lg font-semibold">
          All Teachers
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
                {
                  key: "subjectId",
                  label: "Subject",
                  options: subjects.map((s) => ({
                    label: s.name,
                    value: s.id.toString(),
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
              <FormContainer table="teacher" type="create" relatedData={relatedData} />
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

export default TeacherListPage;
