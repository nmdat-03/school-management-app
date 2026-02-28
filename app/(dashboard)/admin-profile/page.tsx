"use client";

import { UserProfile } from "@clerk/nextjs";

export default function AdminProfilePage() {
  return (
    <div className="flex justify-center py-10">
      <UserProfile />
    </div>
  );
}