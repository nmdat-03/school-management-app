import Image from "next/image";
import Link from "next/link";
import Menu from "../components/Menu";
import Navbar from "../components/Navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex">
      {/* LEFT */}
      <div className="w-[20%] md:w-[10%] xl:w-[20%] p-4 overflow-y-scroll scrollbar-hide">
        <Link
          href="/"
          className="flex items-center justify-center lg:justify-start gap-2"
        >
          <Image src="/logo.png" alt="logo" width={32} height={32} />
          <span className="hidden lg:block font-bold">School Management</span>
        </Link>
        <Menu />
      </div>
      {/* RIGHT */}
      <div className="w-[80%] md:w-[90%] xl:w-[80%] flex flex-col bg-[#F7F8FA] overflow-y-auto scrollbar-hide ">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
