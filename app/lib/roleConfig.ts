export type UserRole = "admin" | "teacher" | "student" | "parent";

export const roleConfig: Record<
  UserRole,
  { label: string; badge: string }
> = {
  admin: {
    label: "Admin",
    badge: "bg-purple-100 text-purple-600",
  },
  teacher: {
    label: "Teacher",
    badge: "bg-green-100 text-green-600",
  },
  student: {
    label: "Student",
    badge: "bg-blue-100 text-blue-600",
  },
  parent: {
    label: "Parent",
    badge: "bg-orange-100 text-orange-600",
  },
};