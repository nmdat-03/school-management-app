import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { AcademicYear, Prisma } from "@prisma/client";
import { ArrowDownWideNarrow } from "lucide-react";
import { redirect } from "next/navigation";

/* ================= TYPES ================= */

type AcademicYearList = AcademicYear;

type SearchParams = {
    page?: string;
    search?: string;
};

/* ================= PAGE ================= */

const AcademicYearListPage = async ({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) => {

    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    const { page, ...queryParams } = await searchParams;

    const currentPage = page ? Number(page) : 1;

    /* ================= QUERY BUILD ================= */

    const query: Prisma.AcademicYearWhereInput = {
        ...(queryParams.search && {
            name: {
                contains: queryParams.search,
                mode: "insensitive",
            },
        }),
    };

    /* ================= DATA ================= */

    const [count, data] = await Promise.all([
        prisma.academicYear.count({ where: query }),

        prisma.academicYear.findMany({
            where: query,
            include: {},
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (currentPage - 1),
        })
    ])

    /* ================= COUNT ================= */

    const totalPages = Math.ceil(count / ITEM_PER_PAGE);

    if (currentPage > totalPages && totalPages > 0) {
        redirect(`?page=${totalPages}`);
    }

    /* ================= TABLE ================= */

    const columns = [
        {
            header: "Name",
            accessor: "name",
        },
        {
            header: "Start Date",
            accessor: "startDate",
            className: "hidden md:table-cell",
        },
        {
            header: "End Date",
            accessor: "endDate",
            className: "hidden md:table-cell",
        },
        {
            header: "Status",
            accessor: "isActive",
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

    const renderRow = (item: AcademicYearList) => {
        return (
            <tr
                key={item.id}
                className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-blue-100"
            >

                <td className="flex items-center gap-4 p-4">{item.name}</td>
                <td className="hidden md:table-cell">{new Intl.DateTimeFormat("vi-VN").format(item.startDate)}</td>
                <td className="hidden md:table-cell">{new Intl.DateTimeFormat("vi-VN").format(item.endDate)}</td>
                <td>
                    {item.isActive ? (
                        <span className="px-2 py-1 text-xs rounded bg-green-200 text-green-800">
                            Active
                        </span>
                    ) : (
                        <span className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-700">
                            Inactive
                        </span>
                    )}
                </td>
                <td>
                    <div className="flex items-center gap-2">
                        {role === "admin" && (
                            <>
                                <FormContainer table="academicYear" type="update" data={item} />
                                <FormContainer table="academicYear" type="delete" id={item.id} />
                            </>
                        )}
                    </div>
                </td>
            </tr >
        )
    };

    /* ================= RETURN ================= */

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">All Academic Years</h1>
                <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-4">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-200">
                            <ArrowDownWideNarrow size={18} />
                        </button>
                        {role === "admin" && (<FormContainer table="academicYear" type="create" />)}
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

export default AcademicYearListPage;
