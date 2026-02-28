import FormContainer from "@/components/FormContainer";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Assignment, Class, Prisma, Subject, Teacher } from "@prisma/client";
import {
  ArrowDownWideNarrow,
  Funnel,
} from "lucide-react";
import { redirect } from "next/navigation";

type AssignmentList = Assignment & { lesson: { schedule: { subject: Subject; class: Class; teacher: Teacher; } } }

const AssignmentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const columns = [
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
      header: "Due Date",
      accessor: "duedate",
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


  const renderRow = (item: AssignmentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-blue-100"
    >
      <td className="flex items-center gap-4 p-4">{item.lesson.schedule.subject.name}</td>
      <td className="hidden md:table-cell">{item.lesson.schedule.class.name}</td>
      <td className="hidden md:table-cell">{item.lesson.schedule.teacher.name + " " + item.lesson.schedule.teacher.surname}</td>
      <td className="hidden md:table-cell">{new Intl.DateTimeFormat("vi-VN").format(item.dueDate)}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" || role === "teacher" && (
            <>
              <FormModal table="assignment" type="update" data={item} />
              <FormModal table="assignment" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = await searchParams;

  const p = page ? Number(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.AssignmentWhereInput = {
    lesson: {
      schedule: {},
    },
  };

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lesson!.schedule!.classId = parseInt(value);
            break;
          case "teacherId":
            query.lesson!.schedule!.teacherId = value;
            break;
          case "search":
            query.lesson!.schedule!.subject = {
              name: { contains: value, mode: "insensitive" },
            };
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS
  switch (role) {
    case "admin":
      break;

    case "teacher":
      query.lesson!.schedule!.teacherId = currentUserId!;
      break;

    case "student":
      query.lesson!.schedule!.class = {
        students: {
          some: {
            id: currentUserId!,
          },
        },
      };
      break;

    case "parent":
      query.lesson!.schedule!.class = {
        students: {
          some: {
            parentId: currentUserId!,
          },
        },
      };
      break;
  }

  const count = await prisma.assignment.count({ where: query });

  const totalPages = Math.ceil(count / ITEM_PER_PAGE);

  if (p > totalPages && totalPages > 0) { redirect(`?page=${totalPages}`); }

  const data = await prisma.assignment.findMany({
    where: query,
    include: {
      lesson: {
        include: {
          schedule: {
            select: {
              subject: { select: { name: true } },
              teacher: { select: { name: true, surname: true } },
              class: { select: { name: true } },
            },
          },
        }
      }
    },
    take: ITEM_PER_PAGE,
    skip: ITEM_PER_PAGE * (p - 1),
  });

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
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-200">
              <Funnel size={18} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-200">
              <ArrowDownWideNarrow size={18} />
            </button>
            {(role === "admin" || role === "teacher") && <FormContainer table="assignment" type="create" />}
          </div>
        </div>
      </div>

      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AssignmentListPage;
