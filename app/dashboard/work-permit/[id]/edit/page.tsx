import Form from "@/app/ui/work-permit/edit-form";
import Breadcrumbs from "@/app/ui/work-permit/breadcrumbs";
import { fetchWorkPermitById, fetchWorkers } from "@/app/lib/data";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [work_permit, workers] = await Promise.all([
    fetchWorkPermitById(id),
    fetchWorkers(),
  ]);

  if (!work_permit) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/work-permit" },
          {
            label: "Edit Work Permit",
            href: `/dashboard/work-permit/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form workPermit={work_permit} workers={workers} />
    </main>
  );
}
