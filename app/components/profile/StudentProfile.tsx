import prisma from "@/lib/prisma";
import Image from "next/image";
import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    School,
    User,
    BookOpen,
    BarChart3,
    UserCheck,
} from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { roleConfig, UserRole } from "@/lib/roleConfig";

const StudentProfile = async ({
    userId,
    role,
}: {
    userId: string;
    role: UserRole;
}) => {
    const student = await prisma.student.findUnique({
        where: { id: userId },
        include: {
            class: { select: { name: true } },
            grade: { select: { level: true } },
            parent: { select: { name: true, surname: true } },
            _count: {
                select: {
                    attendances: true,
                    results: true,
                },
            },
        },
    });

    const user = await currentUser();

    if (!student) {
        return (
            <div className="p-8 text-center text-gray-500">
                Student not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">

                {/* LEFT PANEL */}
                <div className="bg-white rounded-md p-6 flex flex-col items-center text-center shadow-md">

                    <Image
                        src={student.img || "/default-avatar.png"}
                        alt="avatar"
                        width={120}
                        height={120}
                        className="rounded-full object-cover border"
                    />

                    <h1 className="mt-4 text-xl font-semibold text-black">
                        {student.name} {student.surname}
                    </h1>

                    <span className={`mt-2 px-3 py-1 text-xs rounded-full ${roleConfig[role].badge}`}>
                        {roleConfig[role].label}
                    </span>

                    <div className="mt-6 space-y-3 text-sm text-black w-full text-left">
                        <div className="flex items-center gap-2">
                            <User size={16} />
                            Username: {user?.username}
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail size={16} />
                            Email: {student.email || "-"}
                        </div>

                        <div className="flex items-center gap-2">
                            <Phone size={16} />
                            Phone: {student.phone || "-"}
                        </div>

                        <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            Address: {student.address}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="lg:col-span-2 space-y-6">

                    {/* PERSONAL INFO */}
                    <div className="bg-white rounded-md shadow-md p-6">
                        <h2 className="font-semibold text-black mb-4">
                            Personal Information
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6 text-sm text-black">

                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                Birthday:{" "}
                                {new Date(student.birthday).toLocaleDateString()}
                            </div>

                            <div className="flex items-center gap-2">
                                <User size={16} />
                                Gender: {student.gender.charAt(0) + student.gender.slice(1).toLowerCase()}
                            </div>

                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                Created At:{" "}
                                {new Date(student.createdAt).toLocaleDateString()}
                            </div>

                        </div>
                    </div>

                    {/* ACADEMIC INFO */}
                    <div className="bg-white rounded-md shadow-md p-6">
                        <h2 className="font-semibold text-black mb-4">
                            Academic Information
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6 text-sm text-black">

                            <div className="flex items-center gap-2">
                                <School size={16} />
                                Class: <span className="px-3 py-1 text-xs bg-emerald-100 text-emerald-600 rounded-full">{student.class.name}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <BookOpen size={16} />
                                Grade: {student.grade.level}
                            </div>

                            <div className="flex items-center gap-2">
                                <User size={16} />
                                Parent: {student.parent.name}{" "}
                                {student.parent.surname}
                            </div>

                        </div>
                    </div>

                    {/* STATISTICS */}
                    <div className="bg-white rounded-md shadow-md p-6">
                        <h2 className="font-semibold text-black mb-4">
                            Statistics
                        </h2>

                        <div className="grid grid-cols-2 gap-4 text-center">

                            <div className="bg-gray-50 rounded-xl p-4">
                                <UserCheck size={18} className="mx-auto mb-2 text-emerald-500" />
                                <p className="text-lg font-semibold">
                                    {student._count.attendances}
                                </p>
                                <p className="text-xs text-gray-500">Total Attendances</p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <BarChart3 size={18} className="mx-auto mb-2 text-blue-500" />
                                <p className="text-lg font-semibold">
                                    {student._count.results}
                                </p>
                                <p className="text-xs text-gray-500">Total Results</p>
                            </div>


                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudentProfile;