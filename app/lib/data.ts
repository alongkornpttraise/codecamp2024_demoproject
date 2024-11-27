import { sql } from "@vercel/postgres";
import {
  WorkerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
  WorkPermitForm,
} from "./definitions";
import { formatCurrency } from "./utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ITEMS_PER_PAGE = 10;

export async function fetchLatestReports() {
  const reports = await prisma.workPermit.findMany({
    select: {
      work_permit_no: true,
      requester_name: true,
      work_type: true,
      status: true,
      create_date: true,
      approve_date: true,
    },
    orderBy: {
      create_date: "desc", // Orders by the most recent creation date
    },
  });

  return reports.map((report) => ({
    work_permit_no: report.work_permit_no,
    requester_name: report.requester_name,
    work_type: report.work_type,
    status: report.status,
    create_date: report.create_date,
    approve_date: report.approve_date || undefined, // Ensure that undefined is returned if approve_date is null
  }));
}

export async function fetchReportsPages(query: string): Promise<number> {
  try {
    const count = await prisma.workPermit.count({
      where: {
        OR: [
          {
            requester_name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            work_type: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            status: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            create_date: {
              equals: isNaN(Date.parse(query)) ? undefined : new Date(query),
            },
          },
          {
            approve_date: {
              equals: isNaN(Date.parse(query)) ? undefined : new Date(query),
            },
          },
        ],
      },
    });

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of reports.");
  }
}

export async function fetchFilteredReports(
  query: string,
  page: number,
  sortColumn: string,
  sortDirection: "asc" | "desc",
  status: string
) {
  try {
    const whereClause: any = {
      OR: [
        {
          work_permit_no: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          requester_name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          work_type: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          status: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    };

    // Filter by status only if it's not "All"
    if (status !== "All") {
      whereClause.AND = [{ status }];
    }

    const reports = await prisma.workPermit.findMany({
      where: whereClause,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: {
        [sortColumn]: sortDirection,
      },
      select: {
        work_permit_id: true,
        work_permit_no: true,
        requester_name: true,
        work_type: true,
        status: true,
        create_date: true,
        approve_date: true,
        approver: {
          select: {
            user_name: true, // Selecting the approver's name
          },
        },
      },
    });

    return reports.map((report) => ({
      work_permit_id: report.work_permit_id,
      work_permit_no: report.work_permit_no,
      requester_name: report.requester_name,
      work_type: report.work_type,
      status: report.status,
      create_date: report.create_date,
      approve_date: report.approve_date || undefined,
      approver: report.approver?.user_name || "N/A",
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch filtered reports.");
  }
}

export async function fetchWorkers() {
  try {
    const workers = await prisma.user.findMany({
      where: {
        status: "Active",
        roles: {
          some: {
            role: {
              role_name: "Worker",
            },
          },
        },
      },
      select: {
        user_id: true,
        user_name: true,
        email: true,
        title: true,
        first_name: true,
        last_name: true,
      },
      orderBy: {
        first_name: "asc", // Or any other ordering criteria
      },
    });

    return workers;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch workers.");
  }
}

export async function fetchWorkPermitById(id: string) {
  try {
    const workPermit = await prisma.workPermit.findUnique({
      where: { work_permit_id: id, is_active: true },
      select: {
        work_permit_no: true,
        work_permit_id: true,
        requester_name: true,
        work_type: true,
        status: true,
        worker_name: true,
        department: true,
        work_description: true,
        is_high_area: true,
        use_welding_helmet: true,
        use_leather_gloves: true,
        use_full_body_harness: true,
        use_safety_belt: true,
        other_safety_equipment: true,
        working_start_date: true,
        working_end_date: true,
        emergency_person_name: true,
        emergency_mobile_no: true,
        id_card_file_path: true,
        other_document_file_path: true,
        approve_date: true,
        create_date: true,
        create_by: true,
        is_active: true,
        reject_reason_1: true,
        reject_reason_2: true,
      },
    });

    if (!workPermit) {
      throw new Error("Work permit not found");
    }

    // Validate and cast work_type
    const work_type = ["Hotwork", "Coldwork", "PM"].includes(
      workPermit.work_type
    )
      ? (workPermit.work_type as "Hotwork" | "Coldwork" | "PM")
      : "Hotwork"; // Fallback or default value

    // Define valid status options
    const validStatuses: WorkPermitForm["status"][] = [
      "Draft",
      "Work Permit Request",
      "Work Permit Approved",
      "Work Permit Rejected",
      "Real Time",
      "Time Out",
      "Approve to Close",
      "Reject to Close",
      "Close Permit",
    ];

    // Ensure the status is one of the allowed union types
    const mappedStatus = validStatuses.includes(
      workPermit.status as WorkPermitForm["status"]
    )
      ? (workPermit.status as WorkPermitForm["status"])
      : "Draft"; // Fallback if status doesn't match

    return {
      ...workPermit,
      work_type,
      status: mappedStatus, // Use the mapped status
      working_start_date: workPermit.working_start_date
        ? new Date(
            new Date(workPermit.working_start_date).toLocaleString("en-US", {
              timeZone: "Asia/Bangkok",
            })
          ).toISOString()
        : null,

      working_end_date: workPermit.working_end_date
        ? new Date(
            new Date(workPermit.working_end_date).toLocaleString("en-US", {
              timeZone: "Asia/Bangkok",
            })
          ).toISOString()
        : null,

      approve_date: workPermit.approve_date
        ? new Date(
            new Date(workPermit.approve_date).toLocaleString("en-US", {
              timeZone: "Asia/Bangkok",
            })
          ).toISOString()
        : null,

      create_date: workPermit.create_date
        ? new Date(
            new Date(workPermit.create_date).toLocaleString("en-US", {
              timeZone: "Asia/Bangkok",
            })
          ).toISOString()
        : null,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch work permit.");
  }
}

// Fetch total count of Draft work permits
export async function fetchDraftCount() {
  const count = await prisma.workPermit.count({
    where: {
      status: "Draft",
    },
  });
  return count;
}

// Fetch total count of Approved work permits
export async function fetchApprovedCount() {
  const count = await prisma.workPermit.count({
    where: {
      status: "Work Permit Approved",
    },
  });
  return count;
}

// Fetch total count of Real Time work permits
export async function fetchRealTimeCount() {
  const count = await prisma.workPermit.count({
    where: {
      status: "Real Time",
    },
  });
  return count;
}

// Fetch total count of Closed work permits
export async function fetchClosedCount() {
  const count = await prisma.workPermit.count({
    where: {
      status: "Close Permit",
    },
  });
  return count;
}

export async function fetchUser(email: string, role: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      user_id: true,
      user_name: true,
      roles: {
        where: {
          role: {
            role_name: role, // Filter by the provided role
          },
        },
        select: {
          role: {
            select: {
              role_name: true,
            },
          },
        },
      },
    },
  });

  // Return null if the role isn't found for the user
  if (!user || user.roles.length === 0) {
    return null;
  }

  return user;
}
