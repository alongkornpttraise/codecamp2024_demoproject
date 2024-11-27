import Pagination from "@/app/ui/work-permit/pagination";
import Search from "@/app/ui/search";
import Table from "@/app/ui/dashboard/table";
import Cards from "@/app/ui/dashboard/cards";
import {
  CreateReportButton,
  ResetFilterButton,
} from "@/app/ui/work-permit/buttons";
import { lusitana } from "@/app/ui/fonts";
import { ReportsTableSkeleton } from "@/app/ui/skeletons";
import { Suspense } from "react";
import {
  fetchReportsPages,
  fetchDraftCount,
  fetchApprovedCount,
  fetchRealTimeCount,
  fetchClosedCount,
} from "@/app/lib/data";
import StatusDropdown from "@/app/ui/work-permit/status-dropdown";
import DashboardClient from "./page.client"; // Import the client component

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
    status?: string;
  };
}) {
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const status = searchParams?.status || "All";

  const totalPages = await fetchReportsPages(query);
  const draftCount = await fetchDraftCount();
  const approvedCount = await fetchApprovedCount();
  const realTimeCount = await fetchRealTimeCount();
  const closedCount = await fetchClosedCount();

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Dashboard</h1>
      </div>
      {/* Cards Section */}
      <Cards
        draftCount={draftCount}
        approvedCount={approvedCount}
        realTimeCount={realTimeCount}
        closedCount={closedCount}
      />
      {/* Search and Status Dropdown Section */}
      <DashboardClient /> {/* Use the client component here */}
      {/* Table Section */}
      <Suspense
        key={query + currentPage + status}
        fallback={<ReportsTableSkeleton />}
      >
        <Table query={query} currentPage={currentPage} status={status} />
      </Suspense>
      {/* Pagination Section */}
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
