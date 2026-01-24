import Announcements from "@/components/Annoucements";
import BigCalendar from "@/components/BigCalendar";
import FormModal from "@/components/FormModal";
import Performance from "@/components/Performance";
import { role } from "@/lib/data";
import {
  BookOpenCheck,
  CalendarClock,
  CalendarDays,
  LibraryBig,
  Mail,
  MapPinHouse,
  Phone,
  School,
  Shapes,
  User,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const SingleStudentPage = () => {
  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-white p-4 rounded-md flex-1 flex flex-col md:flex-row gap-6">
            {/* Image */}
            <div className="flex justify-center md:justify-start">
              <Image
                src="https://images.pexels.com/photos/5414817/pexels-photo-5414817.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-md object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col gap-4 items-center md:items-start text-center md:text-left">
              {/* Name */}
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">Cameron Moran</h1>
                {role === "admin" && (
                  <FormModal
                    table="student"
                    type="update"
                    data={{
                      id: 1,
                      username: "deanguerrero",
                      email: "deanguerrero@gmail.com",
                      password: "password",
                      firstName: "Dean",
                      lastName: "Guerrero",
                      phone: "+1 234 567 89",
                      address: "1234 Main St, Anytown, USA",
                      dateOfBirth: "2000-01-01",
                      sex: "male",
                      img: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=1200",
                    }}
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col md:flex-row gap-6 text-xs w-full">
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    <span className="text-black font-semibold">01 / 01 / 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span className="text-black font-semibold">
                      +0123 456 789
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span className="text-black font-semibold">
                      user@gmail.com
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinHouse size={16} />
                    <span className="text-black font-semibold">
                      1234 Main St, Anytown, USA
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <School size={16} />
                    <p className="text-gray-500">
                      Grade:{" "}
                      <span className="text-black font-semibold">6th</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <LibraryBig size={16} />
                    <p className="text-gray-500">
                      Class:{" "}
                      <span className="text-black font-semibold">6A1</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <p className="text-gray-500">
                      Advisor:{" "}
                      <span className="text-black font-semibold">John Doe</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarClock size={16} />
                    <p className="text-gray-500">
                      Academic Year:{" "}
                      <span className="text-black font-semibold">
                        2021 - 2025
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* BOTTOM */}
        <div className="h-[800px] p-4 mt-4 bg-white rounded-md">
          <h1 className="font-semibold">Student&apos;s Schedule</h1>
          <BigCalendar />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        {/* SMALL CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          {/* CARD */}
          <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
            <UserCheck />
            <div className="">
              <h1 className="text-xl font-semibold">90%</h1>
              <span className="text-sm text-gray-400">Attendance</span>
            </div>
          </div>
          {/* CARD */}
          <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
            <School />
            <div className="">
              <h1 className="text-xl font-semibold">6th</h1>
              <span className="text-sm text-gray-400">Grade</span>
            </div>
          </div>
          {/* CARD */}
          <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
            <BookOpenCheck />
            <div className="">
              <h1 className="text-xl font-semibold">18</h1>
              <span className="text-sm text-gray-400">Lessons</span>
            </div>
          </div>
          {/* CARD */}
          <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
            <Shapes />
            <div className="">
              <h1 className="text-xl font-semibold">6A</h1>
              <span className="text-sm text-gray-400">Class</span>
            </div>
          </div>
        </div>

        {/* SHORTCUTS */}
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-black">
            <Link
              className="p-3 border border-gray-300 rounded-md hover:scale-105 hover:shadow-md transition-all duration-300"
              href="/"
            >
              Student&apos;s Lessons
            </Link>
            <Link
              className="p-3 border border-gray-300 rounded-md hover:scale-105 hover:shadow-md transition-all duration-300"
              href="/"
            >
              Student&apos;s Teachers
            </Link>
            <Link
              className="p-3 border border-gray-300 rounded-md hover:scale-105 hover:shadow-md transition-all duration-300"
              href="/"
            >
              Student&apos;s Exams
            </Link>
            <Link
              className="p-3 border border-gray-300 rounded-md hover:scale-105 hover:shadow-md transition-all duration-300"
              href="/"
            >
              Student&apos;s Assignments
            </Link>
            <Link
              className="p-3 border border-gray-300 rounded-md hover:scale-105 hover:shadow-md transition-all duration-300"
              href="/"
            >
              Student&apos;s Results
            </Link>
          </div>
        </div>
        {/* <Performance />
        <Announcements /> */}
      </div>
    </div>
  );
};

export default SingleStudentPage;
