// src/companies/trading/pages/ImportWorkspacePage.tsx

import { ArrowLeft, Box } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { useImportStore } from "../store/importStore";
import WorkflowTimeline from "../components/import/WorkflowTimeline";

export default function ImportWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getShipment } = useImportStore();
  const shipment = getShipment(id!);

  if (!shipment) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-slate-500">
          Shipment not found
        </div>
      </AppLayout>
    );
  }

  const containerCount = shipment.draftBL?.containers?.length || 0;

  const handleNavigateDoc = (docKey: string) => {
    navigate(`/trading/imports/${id}/${docKey}`);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/trading/imports")}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Box className="h-5 w-5 text-blue-500" />
                <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
                  Shipment Workspace
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipment Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_20px_rgba(22,31,54,0.04)]">
              <h3 className="text-[15px] font-bold text-slate-800 mb-5 pb-4 border-b border-slate-100">
                Shipment Summary
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Customer
                  </p>
                  <p className="text-[14px] font-medium text-slate-900">
                    {shipment.customer}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Reference Number
                  </p>
                  <p className="text-[14px] font-medium text-slate-900">
                    {shipment.referenceNo}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Containers
                  </p>
                  <p className="text-[14px] font-medium text-slate-900">
                    {containerCount} Units
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Current Stage
                  </p>
                  <p className="text-[14px] font-medium text-blue-600">
                    {shipment.currentStage}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Status
                  </p>
                  <p className="text-[14px] font-medium capitalize text-slate-900">
                    {shipment.status.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Expected Arrival
                  </p>
                  <p className="text-[14px] font-medium text-slate-900">
                    {shipment.expectedArrivalDate
                      ? new Date(shipment.expectedArrivalDate).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Workflow Timeline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_20px_rgba(22,31,54,0.04)]">
              <WorkflowTimeline shipment={shipment} onNavigate={handleNavigateDoc} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Remarks
              </h4>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                {shipment.remarks || "No remarks provided for this shipment."}
              </p>
            </div>
            
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <h4 className="text-[13px] font-semibold text-blue-900 mb-2">
                Workflow Guidance
              </h4>
              <ul className="space-y-2 text-[12px] text-blue-800 list-disc pl-4">
                <li>Start by completing the Draft BL. This data will automatically flow into subsequent documents.</li>
                <li>Upload reference PDFs for the first three documents when available.</li>
                <li>Each document must be completed sequentially to unlock the next stage.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
