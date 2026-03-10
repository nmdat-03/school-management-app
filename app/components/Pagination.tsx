"use client";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter } from "next/navigation";

interface PaginationProps {
  page: number;
  count: number;
}

const Pagination = ({ page, count }: PaginationProps) => {
  const router = useRouter();
  const totalPages = Math.ceil(count / ITEM_PER_PAGE);

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const getPagination = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, "...");
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        // Gần cuối
        pages.push(1, "...");
        pages.push(totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...");
        pages.push(page - 1, page, page + 1);
        pages.push("...", totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="p-4 flex items-center justify-between text-gray-500">
      {/* Prev Button */}
      <button
        disabled={!hasPrev}
        onClick={() => changePage(page - 1)}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition"
      >
        Prev
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-2 text-sm">
        {getPagination().map((item, index) =>
          item === "..." ? (
            <span key={`dots-${index}`} className="px-2 select-none">
              ...
            </span>
          ) : (
            <button
              key={`page-${item}-${index}`}
              onClick={() => changePage(Number(item))}
              className={`px-3 py-1 rounded-md transition ${
                page === item
                  ? "bg-gray-200 text-gray-500"
                  : "hover:bg-gray-200"
              }`}
            >
              {item}
            </button>
          )
        )}
      </div>

      {/* Next Button */}
      <button
        disabled={!hasNext}
        onClick={() => changePage(page + 1)}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;