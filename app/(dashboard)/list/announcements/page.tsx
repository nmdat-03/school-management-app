import FilterComponent from "@/components/FilterComponent";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Announcement, Class, Prisma } from "@prisma/client";
import { ArrowDownWideNarrow } from "lucide-react";
import { redirect } from "next/navigation";

/* ================= TYPES ================= */

type AnnouncementList = Announcement & { class: Class | null }

type SearchParams = {
  page?: string;
  classId?: string;
  gradeLevel?: string;
  search?: string;
};

const AnnouncementListPage = async ({
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

  const andConditions: Prisma.AnnouncementWhereInput[] = [];

  if (queryParams.classId && queryParams.classId !== "all") {
    andConditions.push({
      OR: [
        { classId: Number(queryParams.classId) },
        { classId: null },
      ],
    });
  }

  if (queryParams.gradeLevel) {
    andConditions.push({
      class: {
        grade: {
          level: Number(queryParams.gradeLevel),
        },
      },
    });
  }

  if (queryParams.search) {
    andConditions.push({
      title: {
        contains: queryParams.search,
        mode: Prisma.QueryMode.insensitive,
      },
    });
  }

  /* ================= ROLE CONDITIONS ================= */

  switch (role) {
    case "admin":
      break;

    case "teacher":
      andConditions.push({
        OR: [
          {
            class: {
              schedules: {
                some: {
                  teacherId: currentUserId!,
                },
              },
            },
          },
          { classId: null },
        ],
      });
      break;

    case "student":
      andConditions.push({
        OR: [
          {
            class: {
              enrollments: {
                some: {
                  studentId: currentUserId!,
                },
              },
            },
          },
          { classId: null },
        ],
      });
      break;

    case "parent":
      andConditions.push({
        OR: [
          {
            class: {
              enrollments: {
                some: {
                  student: {
                    parentId: currentUserId!,
                  },
                },
              },
            },
          },
          { classId: null },
        ],
      });
      break;

    default:
      break;
  }

  const query: Prisma.AnnouncementWhereInput = {
    AND: andConditions,
  };

  /* ================= DATA & COUNT ================= */

  const [count, data, classes, grades] = await Promise.all([
    prisma.announcement.count({ where: query, }),

    prisma.announcement.findMany({
      where: query,
      include: {
        class: true,
      },
      orderBy: { date: "desc" },
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

  const relatedData = { classes }

  const totalPages = Math.ceil(count / ITEM_PER_PAGE);

  if (totalPages > 0 && currentPage > totalPages) {
    redirect(`?page=${totalPages}`);
  }

  /* ================= TABLE ================= */

  const columns = [
    {
      header: "Title",
      accessor: "title",
      className: "w-80",
    },
    {
      header: "Description",
      accessor: "description",
      className: "hidden md:table-cell w-80",
    },
    {
      header: "Class",
      accessor: "class",
      className: "w-40"
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell w-40",
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

  const renderRow = (item: AnnouncementList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-blue-100"
    >
      <td className="flex items-center gap-4 p-4 max-w-80">
        <div className="truncate font-medium">
          {item.title}
        </div>
      </td>
      <td className="hidden md:table-cell">
        <div className="truncate max-w-60">
          {item.description}
        </div>
      </td>
      <td className="hidden md:table-cell">{item.class?.name || "All Classes"}</td>
      <td className="hidden md:table-cell">{new Intl.DateTimeFormat("vi-VN").format(item.date)}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="announcement" type="update" data={item} relatedData={relatedData} />
              <FormContainer table="announcement" type="delete" id={item.id} />
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
        <h1 className="hidden md:block text-lg font-semibold">
          All Announcements
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

            {(role === "admin") && (
              <FormContainer table="announcement" type="create" relatedData={relatedData} />
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

export default AnnouncementListPage;
