import React, { useState, useRef, useEffect } from "react";
import { ChartAnalysisResult, Language } from "../types";
import { translations } from "../translations";
import { useAnalysisData } from "../context/AnalysisDataContext";
import {
  ImageIcon,
  Upload,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Sliders,
  ShieldAlert,
  Target,
  BarChart3,
  Layers,
  LineChart,
  Maximize2,
  FileDown,
  FileText,
  FileJson,
} from "lucide-react";
import { TradingViewChart } from "./TradingViewChart";

interface TechnicalAnalyzerProps {
  language: Language;
}

export const TechnicalAnalyzerView: React.FC<TechnicalAnalyzerProps> = ({ language }) => {
  const t = translations[language];

  // Primary mode: TradingView interactive real-time chart vs Upload AI Vision
  const [activeMode, setActiveMode] = useState<"tradingview" | "vision">("tradingview");

  const [analyzing, setAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeAssetLabel, setActiveAssetLabel] = useState<string>("Uploaded Chart");
  const [analysisResult, setAnalysisResult] = useState<ChartAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { openExportModal, triggerExport, updateChartState } = useAnalysisData();

  useEffect(() => {
    updateChartState({
      activeMode,
      activeAssetLabel,
      visionResult: analysisResult,
    });
  }, [activeMode, activeAssetLabel, analysisResult, updateChartState]);

  // Preset sample charts generation helper
  const createPresetChartDataUrl = (type: "btc" | "nvda" | "spy" | "idr"): string => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Background
    ctx.fillStyle = "#0c0919";
    ctx.fillRect(0, 0, 800, 480);

    // Grid lines
    ctx.strokeStyle = "rgba(168, 85, 247, 0.12)";
    ctx.lineWidth = 1;
    for (let x = 60; x < 760; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x, 420);
      ctx.stroke();
    }
    for (let y = 60; y < 420; y += 40) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(760, y);
      ctx.stroke();
    }

    // Title & Info Header
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px 'Plus Jakarta Sans', sans-serif";
    const title =
      type === "btc"
        ? "BTC/USDT 4H • BULLISH CONSOLIDATION BREAKOUT"
        : type === "nvda"
        ? "NVDA 1D • AI DATA CENTER DEMAND TEST"
        : type === "spy"
        ? "SPY 1D • MACRO LIQUIDITY SWEEP"
        : "USD/IDR • CENTRAL BANK INTERVENTION ZONE";
    ctx.fillText(title, 50, 45);

    ctx.font = "12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#a855f7";
    ctx.fillText("FINANNUAL MULTIMODAL QUANT VISION • 2026", 480, 45);

    // Draw realistic candlestick bars
    const candleCount = 28;
    const candleWidth = 14;
    const spacing = 24;
    const startX = 60;

    let currentPrice =
      type === "btc" ? 64000 : type === "nvda" ? 138 : type === "spy" ? 575 : 15700;

    const prices: { open: number; high: number; low: number; close: number }[] = [];
    for (let i = 0; i < candleCount; i++) {
      const isUp =
        type === "btc"
          ? i > 18
            ? Math.random() > 0.3
            : Math.random() > 0.45
          : Math.random() > 0.42;

      const delta = (Math.random() * 0.025 + 0.005) * currentPrice;
      const open = currentPrice;
      const close = isUp ? open + delta : open - delta;
      const high = Math.max(open, close) + Math.random() * 0.012 * currentPrice;
      const low = Math.min(open, close) - Math.random() * 0.012 * currentPrice;
      currentPrice = close;
      prices.push({ open, high, low, close });
    }

    const minP = Math.min(...prices.map((p) => p.low)) * 0.98;
    const maxP = Math.max(...prices.map((p) => p.high)) * 1.02;

    const scaleY = (val: number) => {
      return 400 - ((val - minP) / (maxP - minP)) * 320;
    };

    // Draw candles
    prices.forEach((p, idx) => {
      const x = startX + idx * spacing;
      const isGreen = p.close >= p.open;
      const color = isGreen ? "#10b981" : "#f43f5e";

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      // Wick
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, scaleY(p.high));
      ctx.lineTo(x + candleWidth / 2, scaleY(p.low));
      ctx.stroke();

      // Body
      ctx.fillStyle = color;
      const bodyTop = scaleY(Math.max(p.open, p.close));
      const bodyHeight = Math.max(
        Math.abs(scaleY(p.close) - scaleY(p.open)),
        2
      );
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
    });

    // Draw Exponential Moving Averages
    ctx.strokeStyle = "#8b5cf6"; // 20 EMA
    ctx.lineWidth = 2;
    ctx.beginPath();
    prices.forEach((p, idx) => {
      const x = startX + idx * spacing + candleWidth / 2;
      const y = scaleY(p.close * 0.995);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Volume bars at bottom
    prices.forEach((p, idx) => {
      const x = startX + idx * spacing;
      const volHeight = Math.random() * 45 + 15;
      ctx.fillStyle = p.close >= p.open ? "rgba(16, 185, 129, 0.4)" : "rgba(244, 63, 94, 0.4)";
      ctx.fillRect(x, 430 - volHeight, candleWidth, volHeight);
    });

    return canvas.toDataURL("image/png");
  };

  // Handle drag-and-drop upload
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSelectedImage(dataUrl);
        setActiveAssetLabel(file.name.replace(/\.[^/.]+$/, ""));
        analyzeChartImage(dataUrl, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSelectedImage(dataUrl);
        setActiveAssetLabel(file.name.replace(/\.[^/.]+$/, ""));
        analyzeChartImage(dataUrl, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger analysis for preset sample
  const handlePresetSelect = (presetKey: "btc" | "nvda" | "spy" | "idr", label: string) => {
    const dataUrl = createPresetChartDataUrl(presetKey);
    setSelectedImage(dataUrl);
    setActiveAssetLabel(label);
    analyzeChartImage(dataUrl, label);
  };

  // Call server-side visual technical analyzer API
  const analyzeChartImage = async (base64Image: string, assetName: string) => {
    setAnalyzing(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    try {
      const res = await fetch("/api/chart/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Image,
          assetName,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error("Visual chart analysis failed. Please retry.");
      }

      const data: ChartAnalysisResult = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error("Error analyzing chart:", err);
      setErrorMessage(err.message || "Failed to analyze chart.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#170e2f] via-[#120c24] to-[#1e103d] border border-purple-500/25 p-6 md:p-8 shadow-xl shadow-purple-950/20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-mono mb-3">
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>MULTIMODAL FINANCIAL COMPUTER VISION</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-sans">
            {t.chart.title}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed font-sans">
            {t.chart.subtitle}
          </p>
        </div>
      </div>

      {/* Mode Switcher: TradingView Interactive Terminal vs Upload Vision */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-[#110d24] border border-purple-500/25">
          <button
            onClick={() => setActiveMode("tradingview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold font-sans transition-all cursor-pointer ${
              activeMode === "tradingview"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white hover:bg-purple-900/30"
            }`}
          >
            <LineChart className="w-4 h-4 text-purple-300" />
            <span>{t.chart.tradingViewTab}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-500/40">
              {t.chart.macroTimeframes}
            </span>
          </button>

          <button
            onClick={() => setActiveMode("vision")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold font-sans transition-all cursor-pointer ${
              activeMode === "vision"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white hover:bg-purple-900/30"
            }`}
          >
            <ImageIcon className="w-4 h-4 text-purple-300" />
            <span>{t.chart.visionUploadTab}</span>
            {selectedImage && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeMode === "tradingview" ? (
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-purple-300 mr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Real-time candlestick ticks & indicators active</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-purple-300 mr-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Multimodal Vision AI pattern recognizer</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-[#110d24] p-1.5 rounded-xl border border-purple-500/30">
            <button
              type="button"
              id="chart-export-modal-btn"
              onClick={() => openExportModal("chart")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
              title={t.exportModal.btnTooltip}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{t.exportModal.btnLabel}</span>
            </button>

            <button
              type="button"
              id="chart-quick-pdf-btn"
              onClick={() => triggerExport("pdf", "chart", language)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-300 hover:text-white hover:bg-rose-950/60 border border-rose-500/30 transition-all cursor-pointer"
              title="Download PDF (.pdf)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono">PDF</span>
            </button>

            <button
              type="button"
              id="chart-quick-json-btn"
              onClick={() => triggerExport("json", "chart", language)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-300 hover:text-white hover:bg-emerald-950/60 border border-emerald-500/30 transition-all cursor-pointer"
              title="Download JSON (.json)"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono">JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Interactive Real-Time TradingView Terminal with 1D/1W Macro AI */}
      {activeMode === "tradingview" ? (
        <TradingViewChart
          language={language}
          onSendToVisionAI={(dataUrl, label) => {
            setSelectedImage(dataUrl);
            setActiveAssetLabel(label);
            setActiveMode("vision");
            analyzeChartImage(dataUrl, label);
          }}
        />
      ) : (
        /* Mode 2: File Screenshot Upload Vision AI */
        <div className="space-y-6">
          {/* Drag & Drop Upload Zone with Manual Click Fallback */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed p-8 md:p-10 text-center transition-all cursor-pointer group ${
              isDragging
                ? "border-purple-400 bg-purple-900/30 shadow-xl shadow-purple-900/40 scale-[1.01]"
                : "border-purple-500/35 bg-[#120d26] hover:border-purple-400 hover:bg-purple-950/40 shadow-lg shadow-purple-950/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:border-purple-400 transition-all">
              <Upload className="w-7 h-7 text-purple-300" />
            </div>

            <h3 className="text-base md:text-lg font-bold text-white font-sans mb-1.5">
              {t.chart.dropzoneText}
            </h3>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto font-sans mb-4 leading-relaxed">
              {t.chart.dropzoneSub}
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-200 text-xs font-mono">
              <Eye className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{t.chart.uploadInstruction || t.chart.cameraInstruction}</span>
            </div>
          </div>

          {/* Preset Quick-Test Bar */}
          <div className="rounded-xl bg-[#110d24] border border-purple-500/20 p-4">
            <div className="text-xs font-mono text-purple-300 font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{t.chart.useSample}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => handlePresetSelect("btc", t.chart.sampleBTC)}
                className="px-3 py-2 rounded-lg bg-[#181133] hover:bg-purple-900/40 border border-purple-500/30 text-xs font-medium text-slate-200 hover:text-white transition-all text-left cursor-pointer"
              >
                {t.chart.sampleBTC}
              </button>
              <button
                onClick={() => handlePresetSelect("nvda", t.chart.sampleNVDA)}
                className="px-3 py-2 rounded-lg bg-[#181133] hover:bg-purple-900/40 border border-purple-500/30 text-xs font-medium text-slate-200 hover:text-white transition-all text-left cursor-pointer"
              >
                {t.chart.sampleNVDA}
              </button>
              <button
                onClick={() => handlePresetSelect("spy", t.chart.sampleSPY)}
                className="px-3 py-2 rounded-lg bg-[#181133] hover:bg-purple-900/40 border border-purple-500/30 text-xs font-medium text-slate-200 hover:text-white transition-all text-left cursor-pointer"
              >
                {t.chart.sampleSPY}
              </button>
              <button
                onClick={() => handlePresetSelect("idr", t.chart.sampleIDR)}
                className="px-3 py-2 rounded-lg bg-[#181133] hover:bg-purple-900/40 border border-purple-500/30 text-xs font-medium text-slate-200 hover:text-white transition-all text-left cursor-pointer"
              >
                {t.chart.sampleIDR}
              </button>
            </div>
          </div>

      {/* Analyzing state spinner */}
      {analyzing && (
        <div className="p-12 rounded-2xl bg-[#110d24] border border-purple-500/30 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-400 mb-3" />
          <h3 className="text-base font-bold text-white mb-1 font-sans">
            {t.chart.analyzingChart}
          </h3>
          <p className="text-xs text-purple-300 font-mono">
            Extracting candlesticks, Fair Value Gaps, moving averages & institutional order flow
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          {selectedImage && (
            <button
              onClick={() => analyzeChartImage(selectedImage, activeAssetLabel)}
              className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-white font-mono text-xs cursor-pointer transition-colors"
            >
              Retry Analysis
            </button>
          )}
        </div>
      )}

      {/* Display Chart Preview & Analysis Results */}
      {selectedImage && !analyzing && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Chart Image Preview Column */}
          <div className="lg:col-span-5 rounded-2xl overflow-hidden bg-[#090714] border border-purple-500/30 p-3 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono text-purple-300 mb-2 px-1">
              <span>{activeAssetLabel}</span>
              <span className="text-emerald-400">INPUT SOURCE</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-purple-900/40 bg-black max-h-[380px] flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Selected Chart"
                className="w-full h-auto object-contain max-h-[360px]"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => analyzeChartImage(selectedImage, activeAssetLabel)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-200 text-xs font-mono transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-Analyze</span>
              </button>
            </div>
          </div>

          {/* Analysis & Prediction Results Column */}
          {analysisResult && (
            <div className="lg:col-span-7 space-y-4">
              {/* Primary Prediction Banner */}
              <div className="rounded-2xl bg-gradient-to-br from-[#191035] to-[#120c24] border border-purple-500/40 p-5 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider font-semibold">
                      {t.chart.predictionBias}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div
                        className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-sm font-extrabold font-mono tracking-wider ${
                          analysisResult.prediction === "BULLISH"
                            ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                            : analysisResult.prediction === "BEARISH"
                            ? "bg-rose-950/80 text-rose-300 border border-rose-500/40"
                            : "bg-purple-950/80 text-purple-300 border border-purple-500/40"
                        }`}
                      >
                        {analysisResult.prediction === "BULLISH" ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : analysisResult.prediction === "BEARISH" ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                        <span>{analysisResult.prediction}</span>
                      </div>

                      <span className="text-xs font-mono text-slate-400">
                        {analysisResult.asset} ({analysisResult.timeframe})
                      </span>
                    </div>
                  </div>

                  {/* Confidence Meter */}
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      {t.chart.confidence}
                    </span>
                    <div className="text-xl font-extrabold text-purple-300 font-mono">
                      {analysisResult.confidence}%
                    </div>
                  </div>
                </div>

                {/* Pattern & Trend breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-purple-900/40 text-xs">
                  <div>
                    <span className="text-slate-400 font-mono block mb-1">
                      {t.chart.patternDetected}:
                    </span>
                    <span className="text-white font-bold font-sans">
                      {analysisResult.pattern}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono block mb-1">
                      {t.chart.trendStructure}:
                    </span>
                    <span className="text-purple-200 font-sans">
                      {analysisResult.trend}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trade Setup Matrix */}
              <div className="rounded-xl bg-[#110d24] border border-purple-500/25 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider">
                    {t.chart.tradeSetupTitle}
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-[#090714] p-2.5 rounded-lg border border-purple-950">
                    <span className="text-slate-400 block text-[10px] uppercase">
                      {t.chart.entryZone}
                    </span>
                    <span className="text-white font-bold">
                      {analysisResult.tradeSetup.entryZone}
                    </span>
                  </div>

                  <div className="bg-[#090714] p-2.5 rounded-lg border border-purple-950">
                    <span className="text-emerald-400 block text-[10px] uppercase">
                      {t.chart.tp1}
                    </span>
                    <span className="text-emerald-300 font-bold">
                      {analysisResult.tradeSetup.takeProfit1}
                    </span>
                  </div>

                  <div className="bg-[#090714] p-2.5 rounded-lg border border-purple-950">
                    <span className="text-rose-400 block text-[10px] uppercase">
                      {t.chart.sl}
                    </span>
                    <span className="text-rose-300 font-bold">
                      {analysisResult.tradeSetup.stopLoss}
                    </span>
                  </div>

                  <div className="bg-[#090714] p-2.5 rounded-lg border border-purple-950">
                    <span className="text-purple-400 block text-[10px] uppercase">
                      {t.chart.riskReward}
                    </span>
                    <span className="text-purple-200 font-bold">
                      {analysisResult.tradeSetup.riskRewardRatio}
                    </span>
                  </div>
                </div>

                {/* Key Price Levels */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-purple-950 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] font-mono block">
                      {t.chart.support}:
                    </span>
                    <span className="text-slate-200 font-sans">
                      {analysisResult.keyLevels.support}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] font-mono block">
                      {t.chart.resistance}:
                    </span>
                    <span className="text-slate-200 font-sans">
                      {analysisResult.keyLevels.resistance}
                    </span>
                  </div>
                  <div>
                    <span className="text-rose-400 text-[11px] font-mono block">
                      {t.chart.invalidation}:
                    </span>
                    <span className="text-slate-200 font-sans">
                      {analysisResult.keyLevels.invalidation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hedge Fund Advisory & Executive Summary */}
              <div className="rounded-xl bg-[#130f2a] border border-purple-500/20 p-4 space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300 font-mono mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t.chart.hedgeAdvisory}</span>
                  </div>
                  <p className="text-xs text-purple-200/90 leading-relaxed font-sans">
                    {language === "id"
                      ? analysisResult.hedgeAdvisoryId || analysisResult.hedgeAdvisoryEn
                      : analysisResult.hedgeAdvisoryEn}
                  </p>
                </div>

                <div className="pt-2 border-t border-purple-900/30">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 font-mono mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>{t.chart.executiveSummary}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {language === "id"
                      ? analysisResult.executiveSummaryId || analysisResult.executiveSummaryEn
                      : analysisResult.executiveSummaryEn}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
        </div>
      )}
    </div>
  );
};
