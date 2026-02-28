import prisma from "./prisma";

export type UserProfileResult = {
  img?: string | null;
  name: string;
  surname: string;
  email?: string | null;
  phone?: string | null;
  address: string;
} | null;

export async function getUserProfile(
  userId: string,
  role: string
): Promise<UserProfileResult> {
  switch (role) {
    case "student":
      return prisma.student.findUnique({
        where: { id: userId },
        select: { img: true, name: true, surname: true, email: true, phone: true, address: true },
      });

    case "teacher":
      return prisma.teacher.findUnique({
        where: { id: userId },
        select: { img: true, name: true, surname: true, email: true, phone: true, address: true },
      });

    case "parent":
      return prisma.parent.findUnique({
        where: { id: userId },
        select: { name: true, surname: true, email: true, phone: true, address: true },
      });

    default:
      return null;
  }
}
