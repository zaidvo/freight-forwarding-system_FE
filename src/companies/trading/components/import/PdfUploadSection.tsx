// src/companies/trading/components/import/PdfUploadSection.tsx

import { Upload, Eye, Download, RefreshCw, FileText, FileSearch, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { PdfAttachment } from "../../types/importTypes";
import { useRef, useState } from "react";
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker using a CDN for convenience
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

type Props = {
  pdf?: PdfAttachment;
  onUpload: (file: File) => void | Promise<void>;
  onView?: () => void | Promise<void>;
  onDownload?: () => void | Promise<void>;
  /** Optional: returns the PDF blob for extraction. Used when blobUrl is empty (server-stored PDFs). */
  onDownloadBlob?: () => Promise<Blob>;
  label?: string;
  onTextExtracted?: (text: string) => void;
};

export default function PdfUploadSection({
  pdf,
  onUpload,
  onView,
  onDownload,
  onDownloadBlob,
  label = "Reference PDF",
  onTextExtracted,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadState("uploading");
      setUploadMessage(`Uploading ${file.name}...`);
      try {
        await onUpload(file);
        setUploadState("success");
        setUploadMessage(`${label} received successfully.`);
      } catch (error) {
        console.error("Failed to upload PDF:", error);
        setUploadState("error");
        setUploadMessage(error instanceof Error ? error.message : "PDF upload failed. Please try again.");
      }
    }
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

  const handleExtract = async () => {
    if (!pdf) return;
    setIsExtracting(true);
    setExtractedText(null);
    try {
      let arrayBuffer: ArrayBuffer;

      // Prefer server download if available, otherwise use local blobUrl
      if (onDownloadBlob) {
        const blob = await onDownloadBlob();
        arrayBuffer = await blob.arrayBuffer();
      } else if (pdf.blobUrl) {
        const response = await fetch(pdf.blobUrl);
        arrayBuffer = await response.arrayBuffer();
      } else {
        setExtractedText("Cannot extract: no PDF source available.");
        return;
      }

      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();

        // Group items by their y-position (rounded) to reconstruct lines
        const lineMap = new Map<number, string[]>();
        for (const item of textContent.items as any[]) {
          if (!item.str) continue;
          // The transform matrix: [scaleX, skewX, skewY, scaleY, translateX, translateY]
          const y = Math.round(item.transform[5]);
          if (!lineMap.has(y)) lineMap.set(y, []);
          lineMap.get(y)!.push(item.str);
        }

        // Sort by descending y (PDF y-axis is bottom-up)
        const sortedLines = [...lineMap.entries()]
          .sort((a, b) => b[0] - a[0])
          .map(([, parts]) => parts.join(" ").trim())
          .filter(Boolean);

        fullText += `[Page ${i}]\n${sortedLines.join("\n")}\n\n`;
      }

      const extracted = fullText.trim() || "No readable text found in this PDF.";
      setExtractedText(extracted);
      if (onTextExtracted) onTextExtracted(extracted);
    } catch (error) {
      console.error("Failed to extract text:", error);
      setExtractedText("Error extracting text. Ensure it is a valid digital PDF.");
    } finally {
      setIsExtracting(false);
    }
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
          {uploadMessage && (
            <div
              role="status"
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] ${
                uploadState === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : uploadState === "uploading"
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {uploadState === "uploading" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : uploadState === "error" ? (
                <AlertCircle className="h-3.5 w-3.5" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              <span>{uploadMessage}</span>
            </div>
          )}

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
            <button
              type="button"
              onClick={handleExtract}
              disabled={isExtracting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[12px] font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
            >
              {isExtracting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSearch className="h-3.5 w-3.5" />}
              {isExtracting ? "Extracting..." : "Extract Text"}
            </button>
          </div>
          
          {/* Extracted Text Box */}
          {extractedText && (
            <div className="mt-3 rounded-lg border border-indigo-100 bg-white shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-indigo-50/60 px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <FileSearch className="h-3.5 w-3.5 text-indigo-400" />
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Extracted Text</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setExtractedText(null)}
                  className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
                >
                  ✕ Clear
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[450px] overflow-y-auto p-3.5 space-y-1 bg-slate-50/50">
                {extractedText.split("\n").map((line, idx) => {
                  const isPageHeader = line.startsWith("[Page ") && line.endsWith("]");
                  const isEmpty = line.trim() === "";
                  if (isPageHeader) {
                    return (
                      <div key={idx} className="mt-3 first:mt-0 mb-1 flex items-center gap-2">
                        <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                          {line.replace(/[\[\]]/g, "")}
                        </span>
                        <div className="h-px flex-1 bg-slate-100" />
                      </div>
                    );
                  }
                  if (isEmpty) return <div key={idx} className="h-1" />;
                  return (
                    <p key={idx} className="text-[11.5px] leading-relaxed text-slate-700 font-mono">
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {uploadMessage && (
            <div
              role="status"
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] ${
                uploadState === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-blue-200 bg-blue-50 text-blue-700"
              }`}
            >
              {uploadState === "uploading" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5" />
              )}
              <span>{uploadMessage}</span>
            </div>
          )}
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
        </div>
      )}
    </div>
  );
}
