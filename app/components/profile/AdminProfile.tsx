import Image from "next/image";
import { roleConfig, UserRole } from "@/lib/roleConfig";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

type ClerkUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>;

interface Props {
    user: ClerkUser;
    role: UserRole;
}

const AdminProfile = ({ user, role }: Props) => {
    const roleStyle = roleConfig[role];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8">

                <div className="flex items-center gap-6 border-b pb-6">

                    <Image
                        src={user.imageUrl || "default-avatar.png"}
                        alt="avatar"
                        width={120}
                        height={120}
                        className="rounded-full border object-cover"
                    />

                    <div>
                        <h1 className="text-2xl font-semibold">
                            {user.fullName || user.username}
                        </h1>

                        <span className={`mt-2 inline-block px-3 py-1 text-xs rounded-full ${roleStyle.badge}`}>
                            {roleStyle.label}
                        </span>

                        <p className="text-gray-500 mt-2">
                            {user.primaryEmailAddress?.emailAddress}
                        </p>

                        <Link
                            href="/admin-profile"
                            className="inline-flex items-center gap-2 mt-4 text-sm text-blue-600 hover:underline"
                        >
                            Manage account settings →
                        </Link>
                    </div>
                </div>

                <div className="mt-8 grid md:grid-cols-2 gap-6 text-sm text-gray-700">

                    <div>
                        <p className="text-gray-400">Username</p>
                        <p className="font-medium">{user.username}</p>
                    </div>

                    <div>
                        <p className="text-gray-400">User ID</p>
                        <p className="font-medium">{user.id}</p>
                    </div>

                    <div>
                        <p className="text-gray-400">Account Created</p>
                        <p className="font-medium">
                            {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default AdminProfile;