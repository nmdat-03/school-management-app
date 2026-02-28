import prisma from "@/lib/prisma";
import Image from "next/image";
import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    User,
    BookOpen,
    School,
    BarChart3,
} from "lucide-react";
import { roleConfig, UserRole } from "@/lib/roleConfig";
import { currentUser } from "@clerk/nextjs/server";


const TeacherProfile = async ({
    userId,
    role,
}: {
    userId: string;
    role: UserRole;
}) => {
    const teacher = await prisma.teacher.findUnique({
        where: { id: userId },
        include: {
            subjects: { select: { id: true, name: true } },
            classes: { select: { id: true, name: true } },
            _count: {
                select: {
                    schedules: true,
                    subjects: true,
                    classes: true,
                },
            },
        },
    });

    const user = await currentUser();

    if (!teacher) {
        return (
            <div className="p-8 text-center text-gray-500">
                Teacher not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">

                {/* LEFT PANEL */}
                <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center">

                    <Image
                        src={teacher.img || "/default-avatar.png"}
                        alt="avatar"
                        width={120}
                        height={120}
                        className="rounded-full object-cover border"
                    />

                    <h1 className="mt-4 text-xl font-semibold text-black">
                        {teacher.name} {teacher.surname}
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
                            Email: {teacher.email || "-"}
                        </div>

                        <div className="flex items-center gap-2">
                            <Phone size={16} />
                            Phone: {teacher.phone || "-"}
                        </div>

                        <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            Address: {teacher.address}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="lg:col-span-2 space-y-6">

                    {/* PERSONAL INFO */}
                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <h2 className="font-semibold text-black mb-4">
                            Personal Information
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6 text-sm text-black">

                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                Birthday:{" "}
                                {new Date(teacher.birthday).toLocaleDateString()}
                            </div>

                            <div className="flex items-center gap-2">
                                <User size={16} />
                                Gender: {teacher.gender.charAt(0) + teacher.gender.slice(1).toLowerCase()}
                            </div>

                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                Joined:{" "}
                                {new Date(teacher.createdAt).toLocaleDateString()}
                            </div>

                        </div>
                    </div>

                    {/* TEACHING INFO */}
                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <h2 className="font-semibold text-black mb-4">
                            Teaching Information
                        </h2>

                        {/* Subjects */}
                        <div className="mb-4">
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <BookOpen size={16} /> Subjects
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {teacher.subjects.length > 0 ? (
                                    teacher.subjects.map((subject) => (
                                        <span
                                            key={subject.id}
                                            className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full"
                                        >
                                            {subject.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-400 text-sm">
                                        No subjects assigned
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Classes */}
                        <div>
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <School size={16} /> Classes
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {teacher.classes.length > 0 ? (
                                    teacher.classes.map((cls) => (
                                        <span
                                            key={cls.id}
                                            className="px-3 py-1 text-xs bg-emerald-100 text-emerald-600 rounded-full"
                                        >
                                            {cls.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-400 text-sm">
                                        No classes assigned
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* STATISTICS */}
                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <h2 className="font-semibold text-black mb-4">
                            Statistics
                        </h2>

                        <div className="grid grid-cols-3 gap-4 text-center">

                            <div className="bg-gray-50 rounded-xl p-4">
                                <BarChart3 size={18} className="mx-auto mb-2 text-blue-500" />
                                <p className="text-lg font-semibold">
                                    {teacher._count.subjects}
                                </p>
                                <p className="text-xs text-gray-500">Subjects</p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <BarChart3 size={18} className="mx-auto mb-2 text-emerald-500" />
                                <p className="text-lg font-semibold">
                                    {teacher._count.classes}
                                </p>
                                <p className="text-xs text-gray-500">Classes</p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <BarChart3 size={18} className="mx-auto mb-2 text-indigo-500" />
                                <p className="text-lg font-semibold">
                                    {teacher._count.schedules}
                                </p>
                                <p className="text-xs text-gray-500">Lessons</p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TeacherProfile;