// src/companies/trading/pages/ImportWorkspacePage.tsx

import { useEffect, useState } from "react";
import { ArrowLeft, Box, FileDown, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { useImportStore } from "../store/importStore";
import WorkflowTimeline from "../components/import/WorkflowTimeline";

export default function ImportWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getShipment, loadShipments, isLoading } = useImportStore();
  const shipment = getShipment(id!);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!shipment) void loadShipments();
  }, [shipment, loadShipments]);

  if (!shipment) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-slate-500">
          {isLoading ? "Loading shipment..." : "Shipment not found"}
        </div>
      </AppLayout>
    );
  }

  const containerCount = shipment.draftBL?.containers?.length || 0;

  const handleNavigateDoc = (docKey: string) => {
    navigate(`/trading/imports/${id}/${docKey}`);
  };

  const isPipelineCompleted =
    !!shipment.draftBL &&
    !!shipment.houseBL &&
    !!shipment.masterBL &&
    !!shipment.clearingInvoice &&
    !!shipment.paymentReceipt &&
    !!shipment.detentionInvoice;

  const handleDownloadAll = async () => {
    if (!shipment) return;
    setIsDownloading(true);

    const triggerDownload = (blob: Blob, filename: string) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    };

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      // 1. Draft BL
      if (shipment.draftBL) {
        const { generateDraftBLPdf } = await import("../utils/pdfGenerator");
        const blob = generateDraftBLPdf(shipment.draftBL, shipment);
        triggerDownload(blob, `Draft_BL_${shipment.referenceNo}.pdf`);
        await delay(800);
      }

      // 2. House BL
      if (shipment.houseBL) {
        const { generateHouseBLPdf } = await import("../utils/pdfGenerator");
        const blob = generateHouseBLPdf(shipment.houseBL, shipment);
        triggerDownload(blob, `House_BL_${shipment.referenceNo}.pdf`);
        await delay(800);
      }

      // 3. Master BL
      if (shipment.masterBL) {
        const { generateMasterBLPdf } = await import("../utils/pdfGenerator");
        const blob = generateMasterBLPdf(shipment.masterBL, shipment);
        triggerDownload(blob, `Master_BL_${shipment.referenceNo}.pdf`);
        await delay(800);
      }

      // 4. Freight Invoice
      if (shipment.clearingInvoice) {
        const { generateInvoicePdf } = await import("../utils/pdfGenerator");
        const blob = generateInvoicePdf(shipment.clearingInvoice, shipment);
        triggerDownload(blob, `Freight_Invoice_${shipment.referenceNo}.pdf`);
        await delay(800);
      }

      // 5. Payment Receipt
      if (shipment.paymentReceipt) {
        const { generateReceiptPdf } = await import("../utils/pdfGenerator");
        const blob = generateReceiptPdf(shipment.paymentReceipt, shipment);
        triggerDownload(blob, `Payment_Receipt_${shipment.referenceNo}.pdf`);
        await delay(800);
      }

      // 6. Detention Invoice
      if (shipment.detentionInvoice) {
        const { generateDetentionPdf } = await import("../utils/pdfGenerator");
        const blob = generateDetentionPdf(shipment.detentionInvoice, shipment);
        triggerDownload(blob, `Detention_Invoice_${shipment.referenceNo}.pdf`);
      }
    } catch (error) {
      console.error("Error downloading documents:", error);
      alert("An error occurred during batch download. Please try downloading files individually.");
    } finally {
      setIsDownloading(false);
    }
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
          {isPipelineCompleted && (
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadAll}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] transition hover:bg-blue-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              {isDownloading ? "Downloading Documents..." : "Download All 6 Documents"}
            </button>
          )}
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
