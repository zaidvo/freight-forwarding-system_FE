// src/companies/trading/components/import/WorkflowTimeline.tsx

import {
  FileText,
  FileCheck,
  FilePlus,
  Bell,
  Truck,
  Receipt,
  Check,
  Circle,
  Lock,
} from "lucide-react";
import type { ImportShipment } from "../../types/importTypes";
import DocumentStatusBadge from "./DocumentStatusBadge";

type Props = {
  shipment: ImportShipment;
  onNavigate: (docType: string) => void;
};

type StepConfig = {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  docKey: "draftBL" | "houseBL" | "masterBL" | "arrivalNotice" | "deliveryOrder" | "clearingInvoice";
};

const STEPS: StepConfig[] = [
  {
    key: "draft-bl",
    label: "Draft BL",
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    docKey: "draftBL",
  },
  {
    key: "hbl",
    label: "House BL",
    icon: FileCheck,
    color: "text-violet-500",
    bgColor: "bg-violet-50",
    docKey: "houseBL",
  },
  {
    key: "mbl",
    label: "Master BL",
    icon: FilePlus,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
    docKey: "masterBL",
  },
  {
    key: "arrival-notice",
    label: "Arrival Notice",
    icon: Bell,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    docKey: "arrivalNotice",
  },
  {
    key: "delivery-order",
    label: "Delivery Order",
    icon: Truck,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    docKey: "deliveryOrder",
  },
  {
    key: "invoice",
    label: "Import Clearing Invoice",
    icon: Receipt,
    color: "text-rose-500",
    bgColor: "bg-rose-50",
    docKey: "clearingInvoice",
  },
];

export default function WorkflowTimeline({ shipment, onNavigate }: Props) {
  return (
    <div className="space-y-1">
      <h3 className="text-[13px] font-semibold text-slate-700 mb-3">
        Document Workflow
      </h3>
      <div className="relative">
        {STEPS.map((step, idx) => {
          const doc = shipment[step.docKey];
          const isCreated = !!doc;
          const isApproved = doc?.status === "approved";
          const Icon = step.icon;

          // Determine if this step is the "next" one to complete
          const prevDoc =
            idx > 0 ? shipment[STEPS[idx - 1].docKey] : { status: "approved" };
          const isUnlocked = idx === 0 || !!prevDoc;
          const isLocked = !isUnlocked;

          return (
            <div key={step.key} className="relative flex gap-4">
              {/* Vertical connector line */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`absolute left-[19px] top-[40px] w-0.5 ${
                    isCreated ? "bg-blue-200" : "bg-slate-200"
                  }`}
                  style={{ height: "calc(100% - 16px)" }}
                />
              )}

              {/* Step circle */}
              <div className="relative z-10 shrink-0">
                {isApproved ? (
                  <div className="grid h-[38px] w-[38px] place-items-center rounded-full bg-emerald-100 ring-4 ring-emerald-50">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                ) : isCreated ? (
                  <div
                    className={`grid h-[38px] w-[38px] place-items-center rounded-full ${step.bgColor} ring-4 ring-white`}
                  >
                    <Icon className={`h-4 w-4 ${step.color}`} />
                  </div>
                ) : isLocked ? (
                  <div className="grid h-[38px] w-[38px] place-items-center rounded-full bg-slate-100 ring-4 ring-white">
                    <Lock className="h-3.5 w-3.5 text-slate-300" />
                  </div>
                ) : (
                  <div className="grid h-[38px] w-[38px] place-items-center rounded-full border-2 border-dashed border-slate-300 bg-white ring-4 ring-white">
                    <Circle className="h-3 w-3 text-slate-300" />
                  </div>
                )}
              </div>

              {/* Step card */}
              <button
                type="button"
                onClick={() => onNavigate(step.key)}
                disabled={isLocked}
                className={`mb-3 flex-1 rounded-xl border p-4 text-left transition-all ${
                  isLocked
                    ? "cursor-not-allowed border-slate-100 bg-slate-50/50 opacity-60"
                    : isCreated
                    ? "cursor-pointer border-slate-200 bg-white shadow-[0_2px_8px_rgba(22,31,54,0.04)] hover:shadow-[0_4px_16px_rgba(22,31,54,0.08)] hover:border-blue-200"
                    : "cursor-pointer border-dashed border-slate-200 bg-white/60 hover:border-blue-300 hover:bg-blue-50/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[14px] font-semibold ${
                      isLocked ? "text-slate-400" : "text-slate-800"
                    }`}
                  >
                    {step.label}
                  </span>
                  {isCreated && <DocumentStatusBadge status={doc.status} />}
                </div>
                {isCreated ? (
                  <div className="flex items-center gap-4 text-[12px] text-slate-500">
                    <span>
                      Created:{" "}
                      {new Date(doc.audit.createdDate).toLocaleDateString()}
                    </span>
                    <span>By: {doc.audit.createdBy}</span>
                    {(doc as any).pdf && (
                      <span className="inline-flex items-center gap-1 text-rose-500">
                        <FileText className="h-3 w-3" />
                        PDF
                      </span>
                    )}
                  </div>
                ) : !isLocked ? (
                  <p className="text-[12px] text-slate-400">
                    Click to create this document
                  </p>
                ) : (
                  <p className="text-[12px] text-slate-300">
                    Complete previous step first
                  </p>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
