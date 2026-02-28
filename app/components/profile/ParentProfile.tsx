import prisma from "@/lib/prisma";
import { roleConfig, UserRole } from "@/lib/roleConfig";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
} from "lucide-react";

const ParentProfile = async ({
  userId,
  role,
}: {
  userId: string;
  role: UserRole;
}) => {
  const parent = await prisma.parent.findUnique({
    where: { id: userId },
    include: {
      students: {
        select: {
          id: true,
          name: true,
          surname: true,
          class: { select: { name: true } },
          grade: { select: { level: true } },
        },
      },
    },
  });

  if (!parent) {
    return (
      <div className="p-8 text-center text-gray-500">
        Parent not found.
      </div>
    );
  }

  const roleStyle = roleConfig[role];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">

        {/* LEFT PANEL */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center text-center">

          <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center">
            <Users className="text-orange-600" size={40} />
          </div>

          <h1 className="mt-4 text-xl font-semibold text-gray-800">
            {parent.name} {parent.surname}
          </h1>

          <span
            className={`mt-2 px-3 py-1 text-xs rounded-full ${roleStyle.badge}`}
          >
            {roleStyle.label}
          </span>

          <div className="mt-6 space-y-3 text-sm text-gray-600 w-full text-left">
            <div className="flex items-center gap-2">
              <Mail size={16} />
              {parent.email || "-"}
            </div>

            <div className="flex items-center gap-2">
              <Phone size={16} />
              {parent.phone}
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={16} />
              {parent.address}
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={16} />
              Joined:{" "}
              {new Date(parent.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-2 space-y-6">

          {/* CHILDREN SECTION */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={18} />
              Children
            </h2>

            {parent.students.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {parent.students.map((student) => (
                  <div
                    key={student.id}
                    className="border rounded-xl p-4 bg-gray-50"
                  >
                    <p className="font-medium text-gray-800">
                      {student.name} {student.surname}
                    </p>

                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                      <p>Class: {student.class.name}</p>
                      <p>Grade: {student.grade.level}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No students linked to this parent.
              </p>
            )}
          </div>

          {/* STATISTICS */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">
              Statistics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-lg font-semibold">
                  {parent.students.length}
                </p>
                <p className="text-xs text-gray-500">Total Children</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ParentProfile;