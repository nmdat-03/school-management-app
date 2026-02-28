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
      <div className="w-[18%] md:w-[5%] xl:w-[18%] p-4 overflow-y-scroll scrollbar-hide">
        <Link
          href="/"
          className="flex items-center justify-center lg:justify-start gap-3"
        >
          <Image src="/logo.png" alt="logo" width={32} height={32} />
          <span className="hidden lg:block font-bold">School Name</span>
        </Link>
        <Menu />
      </div>
      {/* RIGHT */}
      <div className="w-[82%] md:w-[95%] xl:w-[82%] flex flex-col bg-[#F7F8FA] overflow-y-auto scrollbar-hide ">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
