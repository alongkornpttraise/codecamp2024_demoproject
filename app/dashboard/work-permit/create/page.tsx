import CreateWorkPermitForm from "@/app/ui/work-permit/create-form";
import Breadcrumbs from "@/app/ui/work-permit/breadcrumbs";
import { fetchWorkers } from "@/app/lib/data";

export default async function Page() {
  const workers = await fetchWorkers();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/work-permit" },
          {
            label: "Create Work Permit",
            href: "/dashboard/work-permit/create",
            active: true,
          },
        ]}
      />
      <CreateWorkPermitForm workers={workers} />
    </main>
  );
}
