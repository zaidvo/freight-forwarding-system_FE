// src/companies/trading/components/import/PdfUploadSection.tsx

import { Upload, Eye, Download, RefreshCw, FileText } from "lucide-react";
import type { PdfAttachment } from "../../types/importTypes";
import { useRef } from "react";

type Props = {
  pdf?: PdfAttachment;
  onUpload: (file: File) => void | Promise<void>;
  onView?: () => void | Promise<void>;
  onDownload?: () => void | Promise<void>;
  label?: string;
};

export default function PdfUploadSection({
  pdf,
  onUpload,
  onView,
  onDownload,
  label = "Reference PDF",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await onUpload(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleView = async () => {
    if (onView) {
      await onView();
      return;
    }
    if (pdf?.blobUrl) window.open(pdf.blobUrl, "_blank");
  };

  const handleDownload = async () => {
    if (!pdf) return;
    if (onDownload) {
      await onDownload();
      return;
    }
    const a = document.createElement("a");
    a.href = pdf.blobUrl;
    a.download = pdf.fileName;
    a.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4 text-slate-400" />
        <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>

      {pdf ? (
        <div className="space-y-3">
          {/* File info */}
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-rose-50">
              <FileText className="h-4 w-4 text-rose-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-slate-800">
                {pdf.fileName}
              </p>
              <p className="text-[11px] text-slate-400">
                {formatSize(pdf.fileSize)} • Uploaded{" "}
                {new Date(pdf.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleView}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 transition hover:bg-slate-50 hover:border-slate-300"
            >
              <Eye className="h-3.5 w-3.5" />
              View PDF
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 transition hover:bg-slate-50 hover:border-slate-300"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[12px] font-medium text-amber-700 transition hover:bg-amber-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Replace
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-white py-6 transition hover:border-blue-300 hover:bg-blue-50/30"
        >
          <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 transition group-hover:bg-blue-100">
            <Upload className="h-5 w-5 text-slate-400 transition group-hover:text-blue-500" />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-medium text-slate-600 group-hover:text-blue-600">
              Upload PDF
            </p>
            <p className="text-[11px] text-slate-400">
              Click to browse or drag and drop
            </p>
          </div>
        </button>
      )}
    </div>
  );
}
