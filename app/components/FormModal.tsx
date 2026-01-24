"use client";

import { FC, useState, ReactNode, ReactElement } from "react";
import dynamic from "next/dynamic";
import { Plus, Edit, Trash2, TriangleAlert, X } from "lucide-react";

import type { StudentFormData } from "./forms/StudentForm";
import type { TeacherFormData } from "./forms/TeacherForm";

type FormType = "create" | "update";
type ModalType = FormType | "delete";

type TableType =
  | "teacher"
  | "student"
  | "parent"
  | "subject"
  | "class"
  | "lesson"
  | "exam"
  | "assignment"
  | "result"
  | "attendance"
  | "event"
  | "announcement";


interface BaseFormProps<T> {
  type: FormType;
  data?: T;
}

const TeacherForm = dynamic<BaseFormProps<TeacherFormData>>(
  () => import("./forms/TeacherForm"),
  { loading: () => <h1>Loading...</h1> }
);

const StudentForm = dynamic<BaseFormProps<StudentFormData>>(
  () => import("./forms/StudentForm"),
  { loading: () => <h1>Loading...</h1> }
);

type FormRenderer = (type: FormType, data?: unknown) => ReactNode;

const forms: Partial<Record<TableType, FormRenderer>> = {
  teacher: (type, data) => (
    <TeacherForm type={type} data={data as TeacherFormData} />
  ),
  student: (type, data) => (
    <StudentForm type={type} data={data as StudentFormData} />
  ),
};

const typeIcons: Record<ModalType, ReactElement> = {
  create: <Plus size={16} />,
  update: <Edit size={16} />,
  delete: <Trash2 size={16} />,
};

interface RenderFormProps {
  type: ModalType;
  table: TableType;
  data?: StudentFormData | TeacherFormData;
  id?: number;
}

const RenderForm: FC<RenderFormProps> = ({
  type,
  table,
  data,
  id,
}) => {
  if (type === "delete" && id) {
    return (
      <form className="p-4 flex flex-col gap-4">
        <TriangleAlert size={50} className="mx-auto" />
        <span className="text-center font-medium">
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        <button className="bg-red-600 text-white py-2 px-4 rounded-md w-max self-center">
          Delete
        </button>
      </form>
    );
  }

  if (type === "create" || type === "update") {
    return <>{forms[table]?.(type, data) ?? null}</>;
  }

  return null;
};

interface FormModalProps {
  table: TableType;
  type: ModalType;
  data?: StudentFormData | TeacherFormData;
  id?: number;
}

const FormModal: FC<FormModalProps> = ({
  table,
  type,
  data,
  id,
}) => {
  const [open, setOpen] = useState(false);

  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-blue-200"
      : type === "update"
      ? "bg-blue-500 text-white"
      : "bg-red-500 text-white";

  return (
    <>
      <button
        className={`${size} ${bgColor} rounded-md flex items-center justify-center`}
        onClick={() => setOpen(true)}
      >
        {typeIcons[type]}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <RenderForm
              type={type}
              table={table}
              data={data}
              id={id}
            />

            <button
              className="absolute top-4 right-4 border-2 p-1 rounded-md hover:border-red-500 hover:text-red-500 transiton-all duration-300"
              onClick={() => setOpen(false)}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
