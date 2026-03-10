import type {
  SubjectSchema,
  TeacherSchema,
  StudentSchema,
  ClassSchema,
  ExamSchema,
  ParentSchema,
  ScheduleSchema,
} from "@/lib/formValidationSchemas";

export type TableType =
  | "teacher"
  | "student"
  | "parent"
  | "subject"
  | "class"
  | "schedule"
  | "academicYear"
  | "exam"
  | "assignment"
  | "result"
  | "attendance"
  | "event"
  | "announcement";

export interface FormDataMap {
  teacher: TeacherSchema;
  student: StudentSchema;
  subject: SubjectSchema;
  class: ClassSchema;
  exam: ExamSchema;
  parent: ParentSchema;
  schedule: ScheduleSchema;
  
  assignment: undefined;
  result: undefined;
  attendance: undefined;
  event: undefined;
  announcement: undefined;
}
