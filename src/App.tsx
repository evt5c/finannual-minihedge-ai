/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Language } from "./types";
import { Header } from "./components/Header";
import { NewsSentimentView } from "./components/NewsSentimentView";
import { TechnicalAnalyzerView } from "./components/TechnicalAnalyzerView";
import { QuantitativeRiskView } from "./components/QuantitativeRiskView";
import { ExportModal } from "./components/ExportModal";
import { AnalysisDataProvider } from "./context/AnalysisDataContext";
import { Shield, Sparkles, Activity, Layers, Globe } from "lucide-react";

export default function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<"news" | "chart" | "quant">("news");

  return (
    <AnalysisDataProvider activeTab={activeTab} language={language}>
      <div className="min-h-screen bg-[#090714] text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
        {/* Top Header */}
        <Header
          language={language}
          onLanguageChange={setLanguage}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {activeTab === "news" && <NewsSentimentView language={language} />}
          {activeTab === "chart" && <TechnicalAnalyzerView language={language} />}
          {activeTab === "quant" && <QuantitativeRiskView language={language} />}
        </main>

        {/* Export Modal */}
        <ExportModal language={language} />

        {/* Futuristic Bottom Footer */}
      <footer className="border-t border-purple-900/30 bg-[#070510] py-6 px-4 sm:px-6 lg:px-8 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-bold text-white">FinAnnual</span>
            <span className="text-purple-500">•</span>
            <span>Mini Hedge AI Terminal</span>
            <span className="text-purple-500">•</span>
            <span className="text-emerald-400">FinBERT v2 + Vision + Stochastic Risk</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span>EN / ID Bilingual Mode</span>
            <span>•</span>
            <span>Institutional Quantitative Models (VaR, Kelly, Sharpe)</span>
            <span>•</span>
            <span className="text-purple-400/80">© {new Date().getFullYear()} FinAnnual</span>
          </div>
        </div>
      </footer>
    </div>
  </AnalysisDataProvider>
  );
}
