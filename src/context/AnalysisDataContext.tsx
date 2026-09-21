import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  NewsItem,
  Language,
  ExportScope,
  ExportFormat,
  ChartAnalysisResult,
  MacroChartAnalysisResult,
  QuantAgentAdvice,
} from "../types";
import {
  buildNewsExportData,
  buildChartExportData,
  buildQuantExportData,
  buildFullDossierReport,
  downloadJsonFile,
  downloadPdfReport,
} from "../utils/exportUtils";

interface ChartStateData {
  asset: string;
  timeframe: string;
  activeMode?: "tradingview" | "vision";
  activeAssetLabel?: string;
  macroAnalysis: MacroChartAnalysisResult | null;
  visionResult: ChartAnalysisResult | null;
}

interface QuantStateData {
  capital: number;
  dailyVol: number;
  confidence: number;
  horizonDays: number;
  varDollar: number;
  varFraction: number;
  cvarDollar: number;
  cvarFraction: number;
  halfKelly: number;
  fullKelly: number;
  quarterKelly: number;
  sharpeRatio: number;
  sortinoRatio: number;
  riskCategory: { label: string };
  agentAdvice?: QuantAgentAdvice | null;
}

interface AnalysisContextType {
  // News state
  newsList: NewsItem[];
  setNewsList: React.Dispatch<React.SetStateAction<NewsItem[]>>;

  // Chart state
  chartState: ChartStateData;
  updateChartState: (partial: Partial<ChartStateData>) => void;

  // Quant state
  quantState: QuantStateData;
  updateQuantState: (partial: Partial<QuantStateData>) => void;

  // Export modal controls
  isExportModalOpen: boolean;
  exportScope: ExportScope;
  setExportScope: (scope: ExportScope) => void;
  openExportModal: (scopeOverride?: ExportScope) => void;
  closeExportModal: () => void;

  // Direct trigger
  triggerExport: (format: ExportFormat, scopeOverride?: ExportScope, language?: Language) => boolean;
}

const defaultChartState: ChartStateData = {
  asset: "BTC/USD",
  timeframe: "1D",
  macroAnalysis: null,
  visionResult: null,
};

const defaultQuantState: QuantStateData = {
  capital: 100000,
  dailyVol: 0.018,
  confidence: 0.95,
  horizonDays: 10,
  varDollar: 8352,
  varFraction: 0.0835,
  cvarDollar: 10471,
  cvarFraction: 0.1047,
  halfKelly: 0.175,
  fullKelly: 0.35,
  quarterKelly: 0.0875,
  sharpeRatio: 1.62,
  sortinoRatio: 2.14,
  riskCategory: { label: "MODERATE / BALANCED" },
  agentAdvice: null,
};

const AnalysisDataContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisDataProvider: React.FC<{
  children: ReactNode;
  activeTab: "news" | "chart" | "quant";
  language: Language;
}> = ({ children, activeTab, language }) => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [chartState, setChartState] = useState<ChartStateData>(defaultChartState);
  const [quantState, setQuantState] = useState<QuantStateData>(defaultQuantState);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<ExportScope>(activeTab);

  const updateChartState = (partial: Partial<ChartStateData>) => {
    setChartState((prev) => ({ ...prev, ...partial }));
  };

  const updateQuantState = (partial: Partial<QuantStateData>) => {
    setQuantState((prev) => ({ ...prev, ...partial }));
  };

  const openExportModal = (scopeOverride?: ExportScope) => {
    setExportScope(scopeOverride || activeTab);
    setIsExportModalOpen(true);
  };

  const closeExportModal = () => {
    setIsExportModalOpen(false);
  };

  const triggerExport = (
    format: ExportFormat,
    scopeOverride?: ExportScope,
    overrideLang?: Language
  ): boolean => {
    const scope = scopeOverride || exportScope || activeTab;
    const lang = overrideLang || language;
    const dateTag = new Date().toISOString().slice(0, 10);

    let reportData;
    let filenameBase = `FinAnnual_${scope.toUpperCase()}_${dateTag}`;

    if (scope === "news") {
      reportData = buildNewsExportData(newsList, lang);
      filenameBase = `FinAnnual_News_Sentiment_${dateTag}`;
    } else if (scope === "chart") {
      reportData = buildChartExportData(
        chartState.asset,
        chartState.timeframe,
        chartState.macroAnalysis,
        chartState.visionResult,
        lang
      );
      filenameBase = `FinAnnual_Technical_${chartState.asset.replace(/[^a-zA-Z0-9]/g, "_")}_${dateTag}`;
    } else if (scope === "quant") {
      reportData = buildQuantExportData(quantState, lang);
      filenameBase = `FinAnnual_Quant_Risk_Model_${dateTag}`;
    } else {
      // "all"
      reportData = buildFullDossierReport(newsList, chartState, quantState, lang);
      filenameBase = `FinAnnual_Master_Terminal_Dossier_${dateTag}`;
    }

    if (format === "json") {
      downloadJsonFile(reportData, filenameBase);
    } else {
      downloadPdfReport(reportData, filenameBase);
    }

    return true;
  };

  return (
    <AnalysisDataContext.Provider
      value={{
        newsList,
        setNewsList,
        chartState,
        updateChartState,
        quantState,
        updateQuantState,
        isExportModalOpen,
        exportScope,
        setExportScope,
        openExportModal,
        closeExportModal,
        triggerExport,
      }}
    >
      {children}
    </AnalysisDataContext.Provider>
  );
};

export const useAnalysisData = () => {
  const context = useContext(AnalysisDataContext);
  if (!context) {
    throw new Error("useAnalysisData must be used within an AnalysisDataProvider");
  }
  return context;
};
