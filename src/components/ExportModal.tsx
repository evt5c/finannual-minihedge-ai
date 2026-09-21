import React, { useState } from "react";
import {
  X,
  Download,
  FileText,
  FileJson,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Activity,
  Layers,
  Clock,
  KeyRound,
  ChevronRight,
  RefreshCw,
  FileDown
} from "lucide-react";
import { Language, ExportScope, ExportFormat } from "../types";
import { translations } from "../translations";
import { useAnalysisData } from "../context/AnalysisDataContext";

interface ExportModalProps {
  language: Language;
}

export const ExportModal: React.FC<ExportModalProps> = ({ language }) => {
  const t = translations[language];
  const {
    isExportModalOpen,
    closeExportModal,
    exportScope,
    setExportScope,
    triggerExport,
    quantState,
    newsList,
    chartState,
  } = useAnalysisData();

  const [downloadingFormat, setDownloadingFormat] = useState<ExportFormat | null>(null);
  const [successFormat, setSuccessFormat] = useState<ExportFormat | null>(null);

  if (!isExportModalOpen) return null;

  const handleDownload = async (format: ExportFormat) => {
    setDownloadingFormat(format);
    setSuccessFormat(null);
    try {
      // Simulate minor async UX tick for polish
      await new Promise((resolve) => setTimeout(resolve, 250));
      triggerExport(format, exportScope, language);
      setSuccessFormat(format);
      setTimeout(() => {
        setSuccessFormat(null);
      }, 3500);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const getScopeLabel = (scope: ExportScope) => {
    switch (scope) {
      case "news":
        return t.exportModal.viewNews;
      case "chart":
        return t.exportModal.viewChart;
      case "quant":
        return t.exportModal.viewQuant;
      case "all":
        return t.exportModal.scopeFullDossier;
    }
  };

  return (
    <div
      id="export-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeExportModal();
      }}
    >
      <div
        id="export-modal-container"
        className="relative w-full max-w-2xl bg-[#0f0b21] border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-950/60 overflow-hidden my-auto"
      >
        {/* Top Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 via-indigo-500 to-fuchsia-500" />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-purple-900/40 bg-[#140f2d]/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300">
              <FileDown className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {t.exportModal.modalTitle}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase font-semibold rounded bg-purple-950 border border-purple-700/50 text-purple-300">
                  OFFLINE ARCHIVE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {t.exportModal.modalSubtitle}
              </p>
            </div>
          </div>

          <button
            id="close-export-modal-btn"
            onClick={closeExportModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto custom-scrollbar">
          {/* 1. Scope Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>{t.exportModal.scopeSectionTitle}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Specific View (Current) */}
              <button
                type="button"
                id="scope-current-view-btn"
                onClick={() => setExportScope(exportScope === "all" ? "quant" : exportScope)}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  exportScope !== "all"
                    ? "bg-purple-950/60 border-purple-500/60 text-white shadow-md shadow-purple-950/40"
                    : "bg-[#130f28] border-purple-900/30 text-slate-300 hover:border-purple-700/50 hover:bg-[#181335]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      {t.exportModal.scopeCurrentView}
                    </div>
                    <div className="text-[11px] text-purple-300/80">
                      {getScopeLabel(exportScope === "all" ? "quant" : exportScope)}
                    </div>
                  </div>
                </div>
                {exportScope !== "all" && (
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                )}
              </button>

              {/* Complete Terminal Dossier */}
              <button
                type="button"
                id="scope-full-dossier-btn"
                onClick={() => setExportScope("all")}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  exportScope === "all"
                    ? "bg-purple-950/60 border-purple-500/60 text-white shadow-md shadow-purple-950/40"
                    : "bg-[#130f28] border-purple-900/30 text-slate-300 hover:border-purple-700/50 hover:bg-[#181335]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      {t.exportModal.scopeFullDossier}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Risk + Chart + News Combined
                    </div>
                  </div>
                </div>
                {exportScope === "all" && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            </div>

            {/* Scope Tabs if user wants to specifically toggle among views */}
            {exportScope !== "all" && (
              <div className="flex items-center gap-2 pt-1">
                {(["quant", "chart", "news"] as ExportScope[]).map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setExportScope(sc)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      exportScope === sc
                        ? "bg-purple-600 text-white border-purple-400 shadow-sm"
                        : "bg-[#15102a] text-slate-400 border-purple-900/30 hover:text-white"
                    }`}
                  >
                    {sc === "quant" ? "Quant Risk" : sc === "chart" ? "Technical Chart" : "News Sentiment"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Format Options */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>{t.exportModal.formatsSectionTitle}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PDF Card */}
              <div className="flex flex-col justify-between p-4.5 rounded-xl bg-[#130e2b] border border-purple-500/25 hover:border-purple-400/50 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm text-white">
                        {t.exportModal.formatPdfTitle}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-mono uppercase font-bold rounded bg-purple-900/60 text-purple-300 border border-purple-700/40">
                      PRINTABLE
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {t.exportModal.formatPdfDesc}
                  </p>
                </div>

                <button
                  type="button"
                  id="download-pdf-btn"
                  onClick={() => handleDownload("pdf")}
                  disabled={downloadingFormat === "pdf"}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/30 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {downloadingFormat === "pdf" ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{t.exportModal.downloading}</span>
                    </>
                  ) : successFormat === "pdf" ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>{language === "id" ? "PDF Berhasil Diunduh!" : "PDF Downloaded!"}</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      <span>{t.exportModal.downloadPdfBtn}</span>
                    </>
                  )}
                </button>
              </div>

              {/* JSON Card */}
              <div className="flex flex-col justify-between p-4.5 rounded-xl bg-[#130e2b] border border-purple-500/25 hover:border-purple-400/50 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <FileJson className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm text-white">
                        {t.exportModal.formatJsonTitle}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-mono uppercase font-bold rounded bg-emerald-950/60 text-emerald-300 border border-emerald-700/40">
                      STRUCTURED
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {t.exportModal.formatJsonDesc}
                  </p>
                </div>

                <button
                  type="button"
                  id="download-json-btn"
                  onClick={() => handleDownload("json")}
                  disabled={downloadingFormat === "json"}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/60 hover:text-white shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {downloadingFormat === "json" ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{t.exportModal.downloading}</span>
                    </>
                  ) : successFormat === "json" ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === "id" ? "JSON Berhasil Diunduh!" : "JSON Downloaded!"}</span>
                    </>
                  ) : (
                    <>
                      <FileJson className="w-3.5 h-3.5" />
                      <span>{t.exportModal.downloadJsonBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 3. Record Preview Details Box */}
          <div className="p-4 rounded-xl bg-[#0b0818] border border-purple-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-purple-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.exportModal.previewDataTitle}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Format: JSON & PDF (A4)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[#140f2d]/80 border border-purple-900/30">
                <div className="text-[10px] text-slate-400">SCOPE</div>
                <div className="font-semibold text-purple-200 truncate">
                  {exportScope === "all" ? "Master Dossier" : exportScope.toUpperCase()}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#140f2d]/80 border border-purple-900/30">
                <div className="text-[10px] text-slate-400">CAPITAL / ASSET</div>
                <div className="font-semibold text-white truncate">
                  {exportScope === "news"
                    ? `${newsList.length} Wires`
                    : exportScope === "chart"
                    ? chartState.asset
                    : `$${quantState.capital.toLocaleString()}`}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#140f2d]/80 border border-purple-900/30">
                <div className="text-[10px] text-slate-400">RISK / VAR</div>
                <div className="font-semibold text-rose-300 truncate">
                  {exportScope === "news"
                    ? "FinBERT v2"
                    : exportScope === "chart"
                    ? chartState.timeframe
                    : `-$${Math.round(quantState.varDollar).toLocaleString()}`}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#140f2d]/80 border border-purple-900/30">
                <div className="text-[10px] text-slate-400">LANGUAGE</div>
                <div className="font-semibold text-emerald-300 truncate">
                  {language.toUpperCase()} (Bilingual)
                </div>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-purple-900/20">
              <span className="flex items-center gap-1 text-slate-400">
                <KeyRound className="w-3 h-3 text-purple-400" />
                <span>SHA-256 Audit Signature Simulation</span>
              </span>
              <span className="text-purple-400">ISO-8601 Timestamped</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-purple-900/40 bg-[#120e29]/70 flex items-center justify-between text-xs">
          <p className="text-[11px] text-slate-400 max-w-sm">
            {t.exportModal.disclaimerNotice}
          </p>
          <button
            type="button"
            id="modal-close-footer-btn"
            onClick={closeExportModal}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-purple-900/30 border border-purple-800/40 transition-colors"
          >
            {t.exportModal.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
