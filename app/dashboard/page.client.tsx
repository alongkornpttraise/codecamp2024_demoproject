"use client";

import { useEffect, useState } from "react";
import Search from "@/app/ui/search";
import StatusDropdown from "@/app/ui/work-permit/status-dropdown";
import {
  CreateReportButton,
  ResetFilterButton,
} from "@/app/ui/work-permit/buttons";

export default function DashboardClient() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Get the role from localStorage
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  return (
    <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
      {/* Place Search and StatusDropdown components side by side */}
      <div className="flex gap-2 flex-1">
        <Search placeholder="Search work permits..." />
        <StatusDropdown />
        <ResetFilterButton />
      </div>
      {/* <CreateReportButton /> */}
      {role === "Worker" && <CreateReportButton />}
    </div>
  );
}
