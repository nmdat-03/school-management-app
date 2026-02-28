import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import AdminProfile from "@/components/profile/AdminProfile";
import StudentProfile from "@/components/profile/StudentProfile";
import TeacherProfile from "@/components/profile/TeacherProfile";
// import ParentProfile from "@/components/profile/ParentProfile";

import { UserRole } from "@/lib/roleConfig";


const ProfilePage = async () => {
  const user = await currentUser();

  if (!user) redirect("/");

  const role = user.publicMetadata.role as UserRole | undefined;

  if (!role) redirect("/");

  switch (role) {

    case "admin":
      return <AdminProfile user={user} role={role} />;

    case "student":
      return <StudentProfile userId={user.id} role={role} />;

    case "teacher":
      return <TeacherProfile userId={user.id} role={role} />;

    // case "parent":
    //   return <ParentProfile userId={user.id} role={role} />;

    default:
      redirect("/");
  }
};

export default ProfilePage;