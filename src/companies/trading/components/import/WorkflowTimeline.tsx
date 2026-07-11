import {
  Check,
  CreditCard,
  FileCheck,
  FilePlus,
  FileText,
  Lock,
  Receipt,
  Timer,
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
  helper: string;
  icon: React.ElementType;
  docKey: "draftBL" | "houseBL" | "masterBL" | "clearingInvoice" | "paymentReceipt" | "detentionInvoice";
};

const STEPS: StepConfig[] = [
  {
    key: "draft-bl",
    label: "Draft BL",
    helper: "Received BL details and reference PDF",
    icon: FileText,
    docKey: "draftBL",
  },
  {
    key: "hbl",
    label: "House BL",
    helper: "House bill details linked to this import",
    icon: FileCheck,
    docKey: "houseBL",
  },
  {
    key: "mbl",
    label: "Master BL",
    helper: "Master carrier bill details",
    icon: FilePlus,
    docKey: "masterBL",
  },
  {
    key: "invoice",
    label: "Freight Invoice",
    helper: "Generated from BL data plus manual charges",
    icon: Receipt,
    docKey: "clearingInvoice",
  },
  {
    key: "payment-receipt",
    label: "Payment Receipt",
    helper: "Generated after payment is recorded",
    icon: CreditCard,
    docKey: "paymentReceipt",
  },
  {
    key: "detention-invoice",
    label: "Detention Invoice",
    helper: "Optional detention and refund calculation",
    icon: Timer,
    docKey: "detentionInvoice",
  },
];

export default function WorkflowTimeline({ shipment, onNavigate }: Props) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-slate-900">Document Flow</h3>
          <p className="mt-1 text-[12px] text-slate-500">
            Complete each document to unlock the next step.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {STEPS.map((step, index) => {
          const doc = shipment[step.docKey];
          const isCreated = Boolean(doc);
          const isApproved = doc?.status === "approved";
          const previousDoc = index > 0 ? shipment[STEPS[index - 1].docKey] : true;
          const isLocked = !previousDoc;
          const Icon = step.icon;

          return (
            <button
              key={step.key}
              type="button"
              onClick={() => onNavigate(step.key)}
              disabled={isLocked}
              className={`flex w-full items-center gap-4 rounded-[14px] border px-4 py-3 text-left transition ${
                isLocked
                  ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
                  : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
              }`}
            >
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                  isApproved
                    ? "bg-emerald-50 text-emerald-600"
                    : isCreated
                      ? "bg-blue-50 text-blue-600"
                      : isLocked
                        ? "bg-slate-100 text-slate-300"
                        : "bg-slate-50 text-slate-500"
                }`}
              >
                {isApproved ? (
                  <Check className="h-4 w-4" />
                ) : isLocked ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[14px] font-semibold ${isLocked ? "text-slate-400" : "text-slate-900"}`}>
                    {step.label}
                  </span>
                  {isCreated && <DocumentStatusBadge status={doc.status} />}
                </div>
                <p className="mt-0.5 text-[12px] text-slate-500">
                  {isCreated
                    ? `Created ${new Date(doc.audit.createdDate).toLocaleDateString()} by ${doc.audit.createdBy}`
                    : isLocked
                      ? "Complete the previous document first"
                      : step.helper}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
