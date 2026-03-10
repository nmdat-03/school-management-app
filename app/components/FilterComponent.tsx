"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Funnel, X } from "lucide-react";

type FilterOption = {
  label: string;
  value: string;
  gradeLevel?: number;
};

type FilterField = {
  key: string;
  label: string;
  options: FilterOption[];
};

type Props = {
  fields: FilterField[];
};

const FilterComponent = ({ fields }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initialFilters = useMemo(() => {
    const obj: Record<string, string> = {};
    fields.forEach((field) => {
      obj[field.key] = searchParams.get(field.key) ?? "";
    });
    return obj;
  }, [fields, searchParams]);

  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const activeCount = Object.values(initialFilters).filter(Boolean).length;
  const hasFilter = activeCount > 0;

  const isDirty = JSON.stringify(filters) !== JSON.stringify(initialFilters);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= FILTER GRADES ================= */

  const filteredFields = useMemo(() => {
    return fields.map((field) => {
      if (field.key !== "classId") return field;

      const selectedGrade = filters["gradeLevel"];

      if (!selectedGrade) return field;

      return {
        ...field,
        options: field.options.filter(
          (opt) =>
            opt.gradeLevel?.toString() === selectedGrade
        ),
      };
    });
  }, [fields, filters]);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (key: string, value: string) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };

      if (key === "gradeLevel") {
        updated.classId = "";
      }

      return updated;
    });
  };

  /* ================= HANDLE APPLY ================= */

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`, {
      scroll: false,
    });

    setOpen(false);
  };

  /* ================= HANDLE CLEAR ================= */

  const handleClear = () => {
    router.push(pathname, { scroll: false });
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`relative w-8 h-8 flex items-center justify-center rounded-md transition
          ${hasFilter
            ? "bg-blue-500 text-white"
            : "bg-blue-200 hover:bg-blue-300"
          }
        `}
      >
        {open ? <X size={18} /> : <Funnel size={18} />}

        {hasFilter && !open && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-md p-4 z-50 border border-gray-200">
          <div className="flex flex-col gap-3">
            {filteredFields.map((field) => (
              <select
                disabled={field.key === "classId" && !filters.gradeLevel}
                key={field.key}
                value={filters[field.key] || ""}
                onChange={(e) =>
                  handleChange(field.key, e.target.value)
                }
                className="border p-2 rounded-md text-sm"
              >
                <option value="">All {field.label}</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ))}

            <div className="flex justify-between mt-2">
              <button
                onClick={handleClear}
                className="px-3 py-1 text-sm border border-red-500 text-red-500 rounded-md hover:text-white hover:bg-red-500 transition"
              >
                Clear
              </button>

              <button
                onClick={handleApply}
                disabled={!isDirty}
                className={`px-3 py-1 text-sm rounded-md text-white transition
                  ${isDirty
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-300 cursor-not-allowed"
                  }
                `}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterComponent;