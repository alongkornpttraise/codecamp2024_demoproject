import { NextResponse } from "next/server";
import { fetchFilteredReports } from "@/app/lib/data";

// Handles GET requests
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const page = searchParams.get("page") || "1";
  const sortColumn = searchParams.get("sortColumn") || "create_date";
  const sortDirection = searchParams.get("sortDirection") || "desc";
  const status = searchParams.get("status") || "All";

  try {
    const workPermits = await fetchFilteredReports(
      query,
      parseInt(page),
      sortColumn,
      sortDirection as "asc" | "desc",
      status
    );
    return NextResponse.json(workPermits);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch work permits" },
      { status: 500 }
    );
  }
}
