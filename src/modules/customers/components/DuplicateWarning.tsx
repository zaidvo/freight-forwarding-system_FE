import { AlertTriangle } from "lucide-react";
import Button from "@/shared/components/ui/Button";
import type { Customer } from "../types";

type Props = {
  matches: Customer[];
  onCancel: () => void;
  onContinue: () => void;
};

export default function DuplicateWarning({ matches, onCancel, onContinue }: Props) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-amber-900">Possible duplicate customer</p>
          <p className="mt-1 text-[12px] text-amber-800">
            A matching name already exists. Review it before creating another record.
          </p>
          <div className="mt-2 space-y-1">
            {matches.map((customer) => (
              <div key={customer.id} className="rounded-lg bg-white/70 px-2.5 py-1.5 text-[12px] text-amber-950">
                <span className="font-semibold">{customer.name}</span>
                <span className="ml-2 text-amber-700">{customer.code} {customer.city ? `• ${customer.city}` : ""}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="button" size="sm" variant="soft" onClick={onContinue}>Create anyway</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
