"use client";

import { UserCircleIcon } from "@heroicons/react/24/outline"; // Import the user icon
import SideNav from "@/app/ui/dashboard/sidenav";
import { useEffect, useState } from "react"; // For fetching username from localStorage

export const experimental_ppr = true;

export default function Layout({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Get the username from localStorage
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);
  }, []);

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-6 md:over-flow-y-auto md:p-12">
        <div className="flex justify-end items-center mb-4">
          {" "}
          {/* Top right username section */}
          <UserCircleIcon className="w-6 h-6 text-black" />{" "}
          {/* Icon in black */}
          <p className="ml-2 text-black">
            Welcome, <span className="text-cyan-600">{username}</span>{" "}
            {/* Username in cyan-600 */}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
