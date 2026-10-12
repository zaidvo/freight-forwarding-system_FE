import type { CustomerRole } from "../types";

const labels: Record<CustomerRole, string> = {
  customer: "Customer",
  shipper: "Shipper",
  consignee: "Consignee",
  clearing_agent: "Clearing Agent",
};

export default function RoleBadge({ role }: { role: CustomerRole }) {
  return (
    <span className="inline-flex rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
      {labels[role]}
    </span>
  );
}

export { labels as customerRoleLabels };
