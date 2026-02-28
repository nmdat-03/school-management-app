"use client";

import { FC, useState, ReactNode, ReactElement } from "react";
import dynamic from "next/dynamic";
import { Plus, Edit, Trash2, TriangleAlert, X, Loader2 } from "lucide-react";

import type { SubjectSchema, ClassSchema, TeacherSchema, StudentSchema, ExamSchema, ParentSchema, ScheduleSchema } from "@/lib/formValidationSchemas";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { TableType } from "@/lib/form";
import { deleteSubject } from "@/lib/actions/subject.action";
import { SubjectRelatedData } from "./forms/SubjectForm";
import { deleteClass } from "@/lib/actions/class.action";
import { ClassRelatedData } from "./forms/ClassForm";
import { deleteTeacher } from "@/lib/actions/teacher.action";
import { TeacherRelatedData } from "./forms/TeacherForm";
import { StudentRelatedData } from "./forms/StudentForm";
import { ExamRelatedData } from "./forms/ExamForm";
import { deleteExam } from "@/lib/actions/exam.action";
import { deleteParent } from "@/lib/actions/parent.action";
import { deleteStudent } from "@/lib/actions/student.action";
import { ScheduleRelatedData } from "./forms/ScheduleForm";
import { deleteSchedule } from "@/lib/actions/schedule.action";

type FormType = "create" | "update";
type ModalType = FormType | "delete";

interface BaseFormProps<T, R = unknown> {
  type: FormType;
  data?: T;
  relatedData?: R;
}

type DeleteIdMap = {
  teacher: string;
  student: string;
  parent: string;
  subject: number;
  class: number;
  schedule: number;
  exam: number;
  assignment: number;
  result: number;
  attendance: number;
  event: number;
  announcement: number;
};

type DeleteActionMap = {
  [K in TableType]?: (id: DeleteIdMap[K]) => Promise<ActionResult>;
};

type FormRenderer = (type: FormType, data?: unknown, relatedData?: unknown) => ReactNode;

export type ActionResult = | { success: true } | { success: false; error?: string }

const Loading = () => (
  <div className="flex items-center justify-center p-6">
    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
  </div>
);

const TeacherForm = dynamic<BaseFormProps<TeacherSchema, TeacherRelatedData>>(
  () => import("./forms/TeacherForm"),
  { loading: () => <Loading /> }
);

const StudentForm = dynamic<BaseFormProps<StudentSchema, StudentRelatedData>>(
  () => import("./forms/StudentForm"),
  { loading: () => <Loading /> }
);

const ParentForm = dynamic<BaseFormProps<ParentSchema, unknown>>(
  () => import("./forms/ParentForm"),
  { loading: () => <Loading /> }
);

const SubjectForm = dynamic<BaseFormProps<SubjectSchema, SubjectRelatedData>>(
  () => import("./forms/SubjectForm"),
  { loading: () => <Loading /> }
);

const ClassForm = dynamic<BaseFormProps<ClassSchema, ClassRelatedData>>(
  () => import("./forms/ClassForm"),
  { loading: () => <Loading /> }
);

const ScheduleForm = dynamic<BaseFormProps<ScheduleSchema, ScheduleRelatedData>>(
  () => import("./forms/ScheduleForm"),
  { loading: () => <Loading /> }
);

const ExamForm = dynamic<BaseFormProps<ExamSchema, ExamRelatedData>>(
  () => import("./forms/ExamForm"),
  { loading: () => <Loading /> }
);



const forms: Partial<Record<TableType, FormRenderer>> = {
  teacher: (type, data, relatedData) => (
    <TeacherForm type={type} data={data as TeacherSchema} relatedData={relatedData as TeacherRelatedData} />
  ),
  student: (type, data, relatedData) => (
    <StudentForm type={type} data={data as StudentSchema} relatedData={relatedData as StudentRelatedData} />
  ),
  parent: (type, data, relatedData) => (
    <ParentForm type={type} data={data as ParentSchema} relatedData={relatedData} />
  ),
  subject: (type, data, relatedData) => (
    <SubjectForm type={type} data={data as SubjectSchema} relatedData={relatedData as SubjectRelatedData} />
  ),
  class: (type, data, relatedData) => (
    <ClassForm type={type} data={data as ClassSchema} relatedData={relatedData as ClassRelatedData} />
  ),
  schedule: (type, data, relatedData) => (
    <ScheduleForm type={type} data={data as ScheduleSchema} relatedData={relatedData as ScheduleRelatedData} />
  ),
  exam: (type, data, relatedData) => (
    <ExamForm type={type} data={data as ExamSchema} relatedData={relatedData as ExamRelatedData} />
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
  data?: unknown;
  id?: number | string;
  relatedData?: unknown;
  closeModal: () => void
}

const RenderForm: FC<RenderFormProps> = ({
  type,
  table,
  data,
  id,
  relatedData,
  closeModal,
}) => {

  const router = useRouter();

  if (type === "delete" && id != null) {
    const handleDelete = async () => {
      try {
        let res: ActionResult | undefined;

        switch (table) {
          case "teacher":
            res = await deleteTeacher(id as string);
            break;

          case "student":
            res = await deleteStudent(id as string);
            break;

          case "parent":
            res = await deleteParent(id as string);
            break;

          case "schedule":
            res = await deleteSchedule(id as number);
            break;

          case "class":
            res = await deleteClass(id as number);
            break;

          case "subject":
            res = await deleteSubject(id as number);
            break;

          case "exam":
            res = await deleteExam(id as number);
            break;

          default:
            return;
        }

        if (res?.success) {
          toast.success("Deleted successfully!");
          closeModal();
          router.refresh();
        } else {
          toast.error("Delete failed!");
        }
      } catch {
        toast.error("Something went wrong!");
      }
    };

    return (
      <form className="p-4 flex flex-col gap-4">
        <TriangleAlert size={50} className="mx-auto" />
        <span className="text-center font-medium">
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        <button type="button" onClick={handleDelete} className="bg-red-600 text-white py-2 px-4 rounded-md w-max self-center">
          Delete
        </button>
      </form>
    );
  }

  if (type === "create" || type === "update") {
    return <>{forms[table]?.(type, data, relatedData) ?? null}</>;
  }

  return null;
};

interface FormModalProps {
  table: TableType;
  type: ModalType;
  data?: unknown;
  id?: number | string;
  relatedData?: unknown;
}

const FormModal: FC<FormModalProps> = ({
  table,
  type,
  data,
  id,
  relatedData,
}) => {

  const [open, setOpen] = useState(false);

  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";

  const bgColor = type === "create" ? "bg-blue-200" : type === "update" ? "bg-blue-500 text-white" : "bg-red-500 text-white";



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
              relatedData={relatedData}
              closeModal={() => setOpen(false)}
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