import { Day } from "@prisma/client";
import { z } from "zod";

/*----------------------------------------------------------------*/
/*                        SUBJECT SCHEMA                          */
/*----------------------------------------------------------------*/
export const subjectSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()).min(1, {
    message: "Please select at least one teacher",
  }), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

/*----------------------------------------------------------------*/
/*                        CLASS SCHEMA                            */
/*----------------------------------------------------------------*/
export const classFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  capacity: z.string().min(1, { message: "Capacity is required!" }),
  gradeId: z.string().min(1, { message: "Grade is required!" }),
  supervisorId: z.string().optional(),
});

export type ClassFormInput = z.infer<typeof classFormSchema>;

export const classSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  capacity: z.number(),
  gradeId: z.number(),
  supervisorId: z.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

/*----------------------------------------------------------------*/
/*                        TEACHER SCHEMA                          */
/*----------------------------------------------------------------*/
export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  birthday: z.preprocess(
    (val) => (val instanceof Date ? val : new Date(val as string)),
    z.date({ message: "Birthday is required!" }),
  ),
  gender: z.enum(["MALE", "FEMALE"], { message: "Gender is required!" }),
  subjects: z.array(z.coerce.number()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const createTeacherSchema = teacherSchema.extend({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long!",
  }),
});

export type CreateTeacherSchema = z.infer<typeof createTeacherSchema>;

export const updateTeacherSchema = teacherSchema.extend({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
});

export type UpdateTeacherSchema = z.infer<typeof updateTeacherSchema>;

/*----------------------------------------------------------------*/
/*                        STUDENT SCHEMA                          */
/*----------------------------------------------------------------*/
export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  birthday: z.preprocess(
    (val) => (val instanceof Date ? val : new Date(val as string)),
    z.date({ message: "Birthday is required!" }),
  ),
  gender: z.enum(["MALE", "FEMALE"], { message: "Gender is required!" }),
  parentId: z.string().min(1, { message: "Parent Id is required!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const createStudentSchema = studentSchema.extend({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long!",
  }),
});

export type CreateStudentSchema = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = studentSchema.extend({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
});

export type UpdateStudentSchema = z.infer<typeof updateStudentSchema>;

/*----------------------------------------------------------------*/
/*                        ENROLL SCHEMA                           */
/*----------------------------------------------------------------*/

export const enrollmentSchema = z.object({
  studentId: z.string(),
  classId: z.coerce.number(),
  academicYearId: z.coerce.number(),
});

export type EnrollFormInput = z.input<typeof enrollmentSchema>;
export type EnrollSchema = z.output<typeof enrollmentSchema>;

/*----------------------------------------------------------------*/
/*                        EXAM SCHEMA                             */
/*----------------------------------------------------------------*/
export const examSchema = z
  .object({
    id: z.coerce.number().optional(),
    title: z.string().min(1, { message: "Title name is required!" }),
    startTime: z.coerce.date({ message: "Start time is required!" }),
    endTime: z.coerce.date({ message: "End time is required!" }),
    maxScore: z.coerce
      .number()
      .min(1, { message: "Score must be at least 1" })
      .max(100)
      .default(10),

    subjectId: z.coerce.number({ message: "Subject is required" }),
    classId: z.coerce.number({ message: "Class is required" }),
    teacherId: z.string({ message: "Teacher is required" }),
    semesterId: z.coerce.number({ message: "Semester is required" }),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export type ExamFormInput = z.input<typeof examSchema>;
export type ExamSchema = z.output<typeof examSchema>;

/*----------------------------------------------------------------*/
/*                     ASSIGNMENT SCHEMA                          */
/*----------------------------------------------------------------*/
export const assignmentSchema = z
  .object({
    id: z.coerce.number().optional(),
    title: z.string().min(1, { message: "Title name is required!" }),
    startDate: z.coerce.date({ message: "Start time is required!" }),
    dueDate: z.coerce.date({ message: "End time is required!" }),
    maxScore: z.coerce
      .number()
      .min(1, { message: "Score must be at least 1" })
      .max(100)
      .default(10),

    subjectId: z.coerce.number({ message: "Subject is required" }),
    classId: z.coerce.number({ message: "Class is required" }),
    teacherId: z.string({ message: "Teacher is required" }),
    semesterId: z.coerce.number({ message: "Semester is required" }),
  })
  .refine((data) => data.dueDate > data.startDate, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export type AssignmentFormInput = z.input<typeof assignmentSchema>;
export type AssignmentSchema = z.output<typeof assignmentSchema>;

/*----------------------------------------------------------------*/
/*                    ACADEMIC YEAR SCHEMA                        */
/*----------------------------------------------------------------*/

export const academicYearSchema = z
  .object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, { message: "Academic year name is required!" }),

    semester1Start: z.coerce.date({
      message: "Semester 1 start date is required!",
    }),
    semester1End: z.coerce.date({
      message: "Semester 1 end date is required!",
    }),

    semester2Start: z.coerce.date({
      message: "Semester 2 start date is required!",
    }),
    semester2End: z.coerce.date({
      message: "Semester 2 end date is required!",
    }),
  })
  .refine((data) => data.semester1End > data.semester1Start, {
    message: "Semester 1 end must be after start",
    path: ["semester1End"],
  })
  .refine((data) => data.semester2End > data.semester2Start, {
    message: "Semester 2 end must be after start",
    path: ["semester2End"],
  })
  .refine((data) => data.semester2Start > data.semester1End, {
    message: "Semester 2 must start after Semester 1",
    path: ["semester2Start"],
  });

export type AcademicYearFormInput = z.input<typeof academicYearSchema>;
export type AcademicYearSchema = z.output<typeof academicYearSchema>;

/*----------------------------------------------------------------*/
/*                        PARENT SCHEMA                           */
/*----------------------------------------------------------------*/
export const parentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().min(1, { message: "Phone number is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
});

export type ParentSchema = z.infer<typeof parentSchema>;

export const createParentSchema = parentSchema.extend({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long!",
  }),
});

export type CreateParentSchema = z.infer<typeof createParentSchema>;

export const updateParentSchema = parentSchema.extend({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
});

export type UpdateParentSchema = z.infer<typeof updateParentSchema>;

/*----------------------------------------------------------------*/
/*                       SCHEDULE SCHEMA                          */
/*----------------------------------------------------------------*/

export const scheduleSchema = z
  .object({
    id: z.coerce.number().optional(),

    day: z.nativeEnum(Day, { message: "Day is required!" }),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),

    subjectId: z.coerce.number().min(1, { message: "Subject is required!" }),
    classId: z.coerce.number().min(1, { message: "Class is required!" }),
    teacherId: z.string().min(1, { message: "Teacher is required!" }),
  })
  .refine(
    (data) => {
      const [startH, startM] = data.startTime.split(":").map(Number);
      const [endH, endM] = data.endTime.split(":").map(Number);

      return endH * 60 + endM > startH * 60 + startM;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

export type ScheduleFormInput = z.input<typeof scheduleSchema> & {
  gradeLevel?: string;
};
export type ScheduleSchema = z.output<typeof scheduleSchema>;

/*----------------------------------------------------------------*/
/*                         EVENT SCHEMA                           */
/*----------------------------------------------------------------*/

export const eventSchema = z
  .object({
    id: z.coerce.number().optional(),

    title: z.string().min(1, { message: "Event title is required!" }),
    description: z.string().min(1, { message: "Description is required!" }),

    startTime: z.coerce.date({ message: "Start time is required!" }),
    endTime: z.coerce.date({ message: "End time is required!" }),

    classId: z
      .union([z.coerce.number(), z.literal("all")])
      .transform((val) => (val === "all" ? null : val))
      .nullable()
      .optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export type EventFormInput = z.input<typeof eventSchema>;
export type EventSchema = z.output<typeof eventSchema>;

/*----------------------------------------------------------------*/
/*                     ANNOUNCEMENT SCHEMA                        */
/*----------------------------------------------------------------*/

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),

  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),

  date: z.coerce.date({ message: "Date is required!" }),

  classId: z.coerce.number().optional(),
});

export type AnnouncementFormInput = z.input<typeof announcementSchema>;
export type AnnouncementSchema = z.output<typeof announcementSchema>;
