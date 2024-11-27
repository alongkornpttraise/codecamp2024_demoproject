"use server";

import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

const WorkPermitSchema = z.object({
  work_permit_id: z.string(),
  requester_name: z
    .string()
    .min(1, "Requester name is required")
    .max(100, "Requester name must be 100 characters or less"),
  work_type: z.enum(["Hotwork", "Coldwork", "PM"]), // Adjust the values based on your application needs
  status: z.enum([
    "Draft",
    "Work Permit Request",
    "Work Permit Approved",
    "Work Permit Rejected",
    "Real Time",
    "Time Out",
    "Approve to Close",
    "Reject to Close",
    "Close Permit",
  ]),
  create_date: z.string().optional(), // Assuming date comes as a string, you can also parse it into a Date object if needed
  approve_date: z.string().optional().nullable(), // Approve date can be null or empty
  worker_name: z.string().optional(), // Optional if not provided at creation
  department: z.string().optional(),
  work_description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional(),
  is_high_area: z.boolean().optional().default(false),
  use_welding_helmet: z.boolean().optional().default(false),
  use_leather_gloves: z.boolean().optional().default(false),
  use_full_body_harness: z.boolean().optional().default(false),
  use_safety_belt: z.boolean().optional().default(false),
  other_safety_equipment: z.string().optional().nullable(),
  working_start_date: z.string(),
  working_end_date: z.string(),
  emergency_person_name: z.string().optional().nullable(),
  emergency_mobile_no: z.string().optional().nullable(),
  id_card_file_path: z.string().optional().nullable(),
  other_document_file_path: z.string().optional().nullable(),
  approver_id: z.string().uuid().optional().nullable(),
  reject_reason_1: z.string().optional().nullable(),
  reject_reason_2: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

const CreateReport = WorkPermitSchema.omit({
  work_permit_id: true,
  create_date: true, // Assuming the create_date is not supposed to be updated
}).extend({
  // Override fields where necessary
  approve_date: z.string().optional().nullable(), // Approve date can be null or empty
  working_start_date: z.string().optional().nullable(), // Optional and nullable for updates
  working_end_date: z.string().optional().nullable(), // Optional and nullable for updates
  emergency_person_name: z.string().optional().nullable(),
  emergency_mobile_no: z.string().optional().nullable(),
  reject_reason_1: z.string().optional().nullable(),
  reject_reason_2: z.string().optional().nullable(),
});

const UpdateReport = WorkPermitSchema.omit({
  work_permit_id: true,
  create_date: true, // Assuming the create_date is not supposed to be updated
}).extend({
  // Override fields where necessary
  approver_id: z.string().optional().nullable(),
  approve_date: z.string().optional().nullable(), // Approve date can be null or empty
  working_start_date: z.string().optional().nullable(), // Optional and nullable for updates
  working_end_date: z.string().optional().nullable(), // Optional and nullable for updates
  emergency_person_name: z.string().optional().nullable(),
  emergency_mobile_no: z.string().optional().nullable(),
  reject_reason_1: z.string().optional().nullable(),
  reject_reason_2: z.string().optional().nullable(),
});

export async function createWorkPermit(formData: FormData) {
  try {
    console.log(
      "Form data before validation (create):",
      Array.from(formData.entries())
    );

    // Parse and validate form data for creation
    const data = CreateReport.parse({
      requester_name: formData.get("requester_name") || "",
      work_type: formData.get("work_type") || "",
      status: formData.get("status") || "Draft",
      create_date: new Date(),
      approve_date: formData.get("approve_date"),
      worker_name: formData.get("worker_name") || "",
      department: formData.get("department") || "",
      work_description: formData.get("work_description") || "",
      is_high_area: formData.get("is_high_area") === "true",
      use_welding_helmet: formData.get("use_welding_helmet") === "true",
      use_leather_gloves: formData.get("use_leather_gloves") === "true",
      use_full_body_harness: formData.get("use_full_body_harness") === "true",
      use_safety_belt: formData.get("use_safety_belt") === "true",
      other_safety_equipment: formData.get("other_safety_equipment") || "",
      working_start_date: formData.get("working_start_date"),
      working_end_date: formData.get("working_end_date"),
      emergency_person_name: formData.get("emergency_person_name") || "",
      emergency_mobile_no: formData.get("emergency_mobile_no") || "",
      id_card_file_path: formData.get("id_card_file_path"),
      other_document_file_path: formData.get("other_document_file_path"),
      approver_id: formData.get("approver_id"),
      is_active: true,
      reject_reason_1: "",
      reject_reason_2: "",
    });

    // Generate the work_permit_no based on the work_type and an incremental number
    const count = await prisma.workPermit.count({
      where: { work_type: data.work_type },
    });

    const workPermitNoPrefix = (() => {
      switch (data.work_type) {
        case "Hotwork":
          return "HW";
        case "Coldwork":
          return "CW";
        case "PM":
          return "PM";
        default:
          throw new Error("Invalid work type");
      }
    })();

    const work_permit_no = `${workPermitNoPrefix}_${String(count + 1).padStart(
      3,
      "0"
    )}`;

    // Create a new work permit with auto-generated work_permit_id
    await prisma.workPermit.create({
      data: {
        ...data,
        work_permit_no, // Include the generated work_permit_no
        department: data.department || "Unknown Department",
        worker_name: data.worker_name || "Unknown Worker",
        requester_name: data.requester_name || "Unknown Requester",
        work_type: data.work_type || "Unknown Type",
        other_safety_equipment: data.other_safety_equipment || "None",
        emergency_person_name:
          data.emergency_person_name || "Unknown Emergency Contact",
        emergency_mobile_no: data.emergency_mobile_no || "0000000000",
        working_start_date: data.working_start_date
          ? new Date(
              new Date(data.working_start_date).toLocaleString("en-US", {
                timeZone: "Asia/Bangkok",
              })
            ).toISOString()
          : null,
        working_end_date: data.working_end_date
          ? new Date(
              new Date(data.working_end_date).toLocaleString("en-US", {
                timeZone: "Asia/Bangkok",
              })
            ).toISOString()
          : null,
        approve_date: data.approve_date
          ? new Date(
              new Date(data.approve_date).toLocaleString("en-US", {
                timeZone: "Asia/Bangkok",
              })
            ).toISOString()
          : null,
        reject_reason_1: "",
        reject_reason_2: "",
      },
    });

    revalidatePath("/dashboard");
    redirect("/dashboard");
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Failed to create work permit.",
    };
  }
}

export async function updateWorkPermitById(
  id: string,
  formData: FormData,
  approver_id?: string,
  reject_reason_1?: string
) {
  try {
    console.log(
      "Form data before validation (update):",
      Array.from(formData.entries())
    );

    const existingWorkPermit = await prisma.workPermit.findUnique({
      where: { work_permit_id: id },
    });

    // Parse the form data based on the updated schema
    const data = UpdateReport.parse({
      requester_name:
        formData.get("requester_name") || existingWorkPermit?.requester_name,
      work_type: formData.get("work_type") || existingWorkPermit?.work_type,
      status: formData.get("status") || existingWorkPermit?.status,
      worker_name:
        formData.get("worker_name") || existingWorkPermit?.worker_name,
      department: formData.get("department") || existingWorkPermit?.department,
      work_description:
        formData.get("work_description") ||
        existingWorkPermit?.work_description,
      is_high_area:
        formData.get("is_high_area") === "true" ||
        existingWorkPermit?.is_high_area,
      use_welding_helmet:
        formData.get("use_welding_helmet") === "true" ||
        existingWorkPermit?.use_welding_helmet,
      use_leather_gloves:
        formData.get("use_leather_gloves") === "true" ||
        existingWorkPermit?.use_leather_gloves,
      use_full_body_harness:
        formData.get("use_full_body_harness") === "true" ||
        existingWorkPermit?.use_full_body_harness,
      use_safety_belt:
        formData.get("use_safety_belt") === "true" ||
        existingWorkPermit?.use_safety_belt,
      other_safety_equipment:
        formData.get("other_safety_equipment") ||
        existingWorkPermit?.other_safety_equipment,
      working_start_date: formData.get("working_start_date") || null,
      working_end_date: formData.get("working_end_date") || null,
      emergency_person_name:
        formData.get("emergency_person_name") ||
        existingWorkPermit?.emergency_person_name,
      emergency_mobile_no:
        formData.get("emergency_mobile_no") ||
        existingWorkPermit?.emergency_mobile_no,
      id_card_file_path:
        formData.get("id_card_file_path") ||
        existingWorkPermit?.id_card_file_path,
      other_document_file_path:
        formData.get("other_document_file_path") ||
        existingWorkPermit?.other_document_file_path,
      approver_id: formData.get("approver_id") || null,
      approve_date: formData.get("approve_date") || null,
      is_active: formData.get("is_active") || existingWorkPermit?.is_active,
      reject_reason_1: formData.get("reject_reason_1") || null,
      reject_reason_2: formData.get("reject_reason_2") || null,
    });

    // Update the work permit in the database
    await prisma.workPermit.update({
      where: { work_permit_id: id },
      data: {
        ...data,
        worker_name: data.worker_name || "Unknown Worker",
        requester_name: data.requester_name || "Unknown Requester",
        other_safety_equipment: data.other_safety_equipment || "None",
        emergency_person_name:
          data.emergency_person_name || "Unknown Emergency Contact",
        emergency_mobile_no: data.emergency_mobile_no || "0000000000",
        working_start_date: data.working_start_date
          ? new Date(
              new Date(data.working_start_date).toLocaleString("en-US", {
                timeZone: "Asia/Bangkok",
              })
            ).toISOString()
          : null,
        working_end_date: data.working_end_date
          ? new Date(
              new Date(data.working_end_date).toLocaleString("en-US", {
                timeZone: "Asia/Bangkok",
              })
            ).toISOString()
          : null,
        approve_date: data.approve_date
          ? new Date(
              new Date(data.approve_date).toLocaleString("en-US", {
                timeZone: "Asia/Bangkok",
              })
            ).toISOString()
          : null,
        reject_reason_1: data.reject_reason_1 || "",
        reject_reason_2: data.reject_reason_2 || "",
      },
    });

    // Revalidate the page and redirect
    if (approver_id) {
      revalidatePath(`/dashboard/`);
      redirect(`/dashboard/`);
    } else {
      revalidatePath(`/dashboard/work-permit/${id}/edit`);
      redirect(`/dashboard/work-permit/${id}/edit`);
    }
  } catch (error) {
    console.error("Failed to update work permit:", error);
    throw error;
  }
}
