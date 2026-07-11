import { useEffect, useState } from "react";
import { ArrowLeft, Box, CalendarDays, FileDown, Loader2, Package, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { useImportStore } from "../store/importStore";
import WorkflowTimeline from "../components/import/WorkflowTimeline";
import type { ImportShipment } from "../types/importTypes";

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
        <div className="flex h-64 items-center justify-center text-slate-500">
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
      if (shipment.draftBL) {
        const { generateDraftBLPdf } = await import("../utils/pdfGenerator");
        triggerDownload(generateDraftBLPdf(shipment.draftBL, shipment), `Draft_BL_${shipment.referenceNo}.pdf`);
        await delay(800);
      }

      if (shipment.houseBL) {
        const { generateHouseBLPdf } = await import("../utils/pdfGenerator");
        triggerDownload(generateHouseBLPdf(shipment.houseBL, shipment), `House_BL_${shipment.referenceNo}.pdf`);
        await delay(800);
      }

      if (shipment.masterBL) {
        const { generateMasterBLPdf } = await import("../utils/pdfGenerator");
        triggerDownload(generateMasterBLPdf(shipment.masterBL, shipment), `Master_BL_${shipment.referenceNo}.pdf`);
        await delay(800);
      }

      if (shipment.clearingInvoice) {
        const { generateInvoicePdf } = await import("../utils/pdfGenerator");
        triggerDownload(generateInvoicePdf(shipment.clearingInvoice, shipment), `Freight_Invoice_${shipment.referenceNo}.pdf`);
        await delay(800);
      }

      if (shipment.paymentReceipt) {
        const { generateReceiptPdf } = await import("../utils/pdfGenerator");
        triggerDownload(generateReceiptPdf(shipment.paymentReceipt, shipment), `Payment_Receipt_${shipment.referenceNo}.pdf`);
        await delay(800);
      }

      if (shipment.detentionInvoice) {
        const { generateDetentionPdf } = await import("../utils/pdfGenerator");
        triggerDownload(generateDetentionPdf(shipment.detentionInvoice, shipment), `Detention_Invoice_${shipment.referenceNo}.pdf`);
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
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/trading/imports")}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                aria-label="Back to import shipments"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <Box className="h-5 w-5 text-blue-500" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-500">
                    Import Shipment
                  </p>
                </div>
                <h1 className="mt-1 text-[24px] font-bold tracking-[-0.04em] text-slate-950">
                  {shipment.referenceNo}
                </h1>
                <p className="mt-1 text-[14px] text-slate-500">
                  {shipment.customer || "No customer selected"}
                </p>
              </div>
            </div>

            {isPipelineCompleted && (
              <button
                type="button"
                disabled={isDownloading}
                onClick={handleDownloadAll}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.24)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                {isDownloading ? "Downloading..." : "Download All Documents"}
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryItem icon={User} label="Salesperson" value={shipment.salesperson || "-"} />
            <SummaryItem icon={Package} label="Containers" value={`${containerCount} unit${containerCount === 1 ? "" : "s"}`} />
            <SummaryItem icon={CalendarDays} label="Expected Arrival" value={shipment.expectedArrivalDate ? formatDate(shipment.expectedArrivalDate) : "-"} />
            <SummaryItem icon={Box} label="Status" value={formatStage(shipment.status)} accent />
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <section className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
            <WorkflowTimeline shipment={shipment} onNavigate={handleNavigateDoc} />
          </section>

          <aside className="space-y-4">
            <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Current Stage
              </h2>
              <p className="mt-2 text-[18px] font-bold text-blue-600">
                {formatStage(shipment.currentStage)}
              </p>
              <p className="mt-3 text-[13px] leading-6 text-slate-500">
                Open the next available document from the flow and complete the required fields.
              </p>
            </div>

            <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Remarks
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-slate-600">
                {shipment.remarks || "No remarks provided for this shipment."}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}

type SummaryItemProps = {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
};

function SummaryItem({ icon: Icon, label, value, accent = false }: SummaryItemProps) {
  return (
    <div className="rounded-[14px] border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className={`mt-2 text-[14px] font-semibold ${accent ? "text-blue-600" : "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatStage(value: ImportShipment["currentStage"] | ImportShipment["status"]) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
