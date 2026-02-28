"use client";

import { useClerk } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  img?: string | null;
}

const UserMenu = ({ img }: Props) => {
  const { signOut } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar */}
      <Image
        src={img || "/default-avatar.png"}
        alt="avatar"
        width={38}
        height={38}
        className="rounded-full cursor-pointer object-cover border hover:ring-2 hover:ring-blue-400 transition"
        onClick={() => setOpen(!open)}
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border animate-in fade-in zoom-in-95 duration-150 z-50">
          <div className="p-3 border-b text-sm font-medium">
            Account
          </div>

          {/* Profile */}
          <button
            onClick={() => {
              router.push("/profile");
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 transition"
          >
            <User size={16} />
            Profile
          </button>

          {/* Logout */}
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

