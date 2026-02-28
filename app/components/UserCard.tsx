import prisma from "@/lib/prisma";
import {
  ShieldCheck,
  GraduationCap,
  Users,
  Backpack,
  List,
} from "lucide-react";
import Link from "next/link";

type UserType = "admin" | "teacher" | "student" | "parent";

const iconMap = {
  admin: ShieldCheck,
  teacher: GraduationCap,
  student: Backpack,
  parent: Users,
};

const colorMap = {
  admin: "from-indigo-500 to-indigo-600",
  teacher: "from-blue-500 to-blue-600",
  student: "from-emerald-500 to-emerald-600",
  parent: "from-orange-500 to-orange-600",
};

const routeMap: Record<UserType, string> = {
  admin: "/admin",
  teacher: "/list/teachers",
  student: "/list/students",
  parent: "/list/parents",
};

const UserCard = async ({ type }: { type: UserType }) => {
  const modelMap: Record<UserType, { count: () => Promise<number> }> = {
    admin: prisma.admin,
    teacher: prisma.teacher,
    student: prisma.student,
    parent: prisma.parent,
  };

  const data = await modelMap[type].count();

  const Icon = iconMap[type];

  return (
    <div className="relative flex-1 min-w-[120px] rounded-xl bg-white shadow-md overflow-hidden group">

      {/* Top gradient bar */}
      <div
        className={`h-2 bg-gradient-to-r ${colorMap[type]}`}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div
            className={`p-2 rounded-lg bg-gradient-to-br ${colorMap[type]} text-white shadow-md`}
          >
            <Icon className="w-5 h-5" />
          </div>

          <Link href={routeMap[type]}>
            <List size={20} className="text-black cursor-pointer" />
          </Link>
        </div>

        {/* Count */}
        <h1 className="text-3xl font-bold mt-6 text-gray-800 tracking-tight">
          {data}
        </h1>

        {/* Label */}
        <p className="text-sm text-gray-500 capitalize mt-1">
          Total {type}s
        </p>
      </div>
    </div>
  );
};

export default UserCard;