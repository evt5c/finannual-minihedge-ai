import React, { useState } from "react";
import { Language, QuantAgentAdvice } from "../types";
import { translations } from "../translations";
import {
  ShieldAlert,
  Percent,
  Calculator,
  TrendingDown,
  Activity,
  Sparkles,
  RefreshCw,
  Zap,
  CheckCircle2,
  DollarSign,
  Send,
  HelpCircle,
  Sliders,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Flame,
  Scale
} from "lucide-react";

interface QuantitativeRiskProps {
  language: Language;
}

export const QuantitativeRiskView: React.FC<QuantitativeRiskProps> = ({ language }) => {
  const t = translations[language];

  // View Mode: Intermediate (Practical & Intuitive) vs Advanced (Full Quant Math)
  const [riskMode, setRiskMode] = useState<"intermediate" | "advanced">("intermediate");

  // State to toggle formula expansion in intermediate mode
  const [showFormulas, setShowFormulas] = useState(false);

  // Portfolio inputs
  const [capital, setCapital] = useState<number>(100000);
  const [dailyVol, setDailyVol] = useState<number>(0.018); // 1.8% daily vol
  const [confidence, setConfidence] = useState<0.95 | 0.99>(0.95);
  const [horizonDays, setHorizonDays] = useState<number>(10);
  const [winRate, setWinRate] = useState<number>(0.56); // 56% win rate
  const [winLossRatio, setWinLossRatio] = useState<number>(2.0); // 2:1 payoff
  const [portfolioReturn, setPortfolioReturn] = useState<number>(0.21); // 21% annual return
  const [riskFreeRate, setRiskFreeRate] = useState<number>(0.045); // 4.5% Treasury
  const [downsideDev, setDownsideDev] = useState<number>(0.08); // 8% downside dev

  // Active stress test scenario
  const [activeScenario, setActiveScenario] = useState<number | null>(null);

  // Quant AI Agent inquiry state
  const [agentQuery, setAgentQuery] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentAdvice, setAgentAdvice] = useState<QuantAgentAdvice | null>(null);

  // 1. Math computation: Parametric VaR (Value at Risk)
  const zScore = confidence === 0.95 ? 1.64485 : 2.32635;
  const timeScale = Math.sqrt(horizonDays);
  const varFraction = zScore * dailyVol * timeScale;
  const varDollar = capital * varFraction;

  // 2. Math computation: CVaR (Conditional VaR / Expected Shortfall)
  const phiZ = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * zScore * zScore);
  const tailAlpha = 1 - confidence;
  const cvarMultiplier = phiZ / tailAlpha;
  const cvarFraction = cvarMultiplier * dailyVol * timeScale;
  const cvarDollar = capital * cvarFraction;

  // 3. Math computation: Kelly Criterion
  const q = 1 - winRate;
  const fullKelly = Math.max(0, (winLossRatio * winRate - q) / winLossRatio);
  const halfKelly = fullKelly / 2;
  const quarterKelly = fullKelly / 4;

  // 4. Math computation: Sharpe & Sortino
  const annualizedVol = dailyVol * Math.sqrt(252);
  const sharpeRatio = annualizedVol > 0 ? (portfolioReturn - riskFreeRate) / annualizedVol : 0;
  const sortinoRatio = downsideDev > 0 ? (portfolioReturn - riskFreeRate) / downsideDev : 0;

  // Preset configuration handler for intermediate traders
  const handleApplyPreset = (preset: "conservative" | "balanced" | "aggressive") => {
    if (preset === "conservative") {
      setCapital(50000);
      setDailyVol(0.012);
      setConfidence(0.95);
      setHorizonDays(5);
      setWinRate(0.62);
      setWinLossRatio(1.8);
      setPortfolioReturn(0.14);
      setDownsideDev(0.05);
    } else if (preset === "balanced") {
      setCapital(100000);
      setDailyVol(0.018);
      setConfidence(0.95);
      setHorizonDays(10);
      setWinRate(0.56);
      setWinLossRatio(2.0);
      setPortfolioReturn(0.21);
      setDownsideDev(0.08);
    } else {
      setCapital(25000);
      setDailyVol(0.032);
      setConfidence(0.95);
      setHorizonDays(10);
      setWinRate(0.50);
      setWinLossRatio(2.5);
      setPortfolioReturn(0.35);
      setDownsideDev(0.14);
    }
  };

  // Overall Risk Level badge
  const riskCategory =
    dailyVol <= 0.014
      ? { label: language === "id" ? "Rendah (Konservatif)" : "Low (Conservative)", color: "text-emerald-400", bg: "bg-emerald-950/60", border: "border-emerald-500/40" }
      : dailyVol <= 0.024
      ? { label: language === "id" ? "Moderat (Seimbang)" : "Moderate (Balanced)", color: "text-purple-300", bg: "bg-purple-950/60", border: "border-purple-500/40" }
      : { label: language === "id" ? "Tinggi (Agresif / Kripto)" : "High Exposure (Crypto / Growth)", color: "text-rose-400", bg: "bg-rose-950/60", border: "border-rose-500/40" };

  // Stress scenarios definitions
  const scenarios = [
    {
      id: 1,
      title: t.quant.scenario1,
      shock: -0.28,
      vixJump: "+125%",
      hedgeRequirement: language === "id" ? "Alokasi Kas 35% / Opsi Put Protektif" : "35% Cash Buffer & Index Put Protection",
    },
    {
      id: 2,
      title: t.quant.scenario2,
      shock: -0.15,
      vixJump: "+70%",
      hedgeRequirement: language === "id" ? "Cadangan Kas 20% & Trailing Stop Ketat" : "20% Cash Buffer & Tight Trailing Stops",
    },
    {
      id: 3,
      title: t.quant.scenario3,
      shock: -0.085,
      vixJump: "+35%",
      hedgeRequirement: language === "id" ? "Kurangi Saham Ber-Beta Tinggi" : "Trim High-Beta Growth & Tech Positions",
    },
    {
      id: 4,
      title: t.quant.scenario4,
      shock: -0.11,
      vixJump: "+90%",
      hedgeRequirement: language === "id" ? "Lindung Nilai Komoditas / Energi" : "Commodity Long & Diversified Overlay",
    },
  ];

  // Ask Quant Agent
  const handleAskAgent = async (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    const queryToSend = presetQuery || agentQuery;
    if (!queryToSend.trim()) return;

    setAgentLoading(true);
    try {
      const res = await fetch("/api/quant/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryToSend,
          language,
          portfolioMetrics: {
            capital,
            dailyVol,
            confidenceLevel: confidence,
            holdingDays: horizonDays,
            varDollar,
            cvarDollar,
            kelly: (halfKelly * 100).toFixed(1),
            sharpe: sharpeRatio.toFixed(2),
            sortino: sortinoRatio.toFixed(2),
          },
        }),
      });

      if (!res.ok) throw new Error("Quant agent query failed.");
      const data: QuantAgentAdvice = await res.json();
      setAgentAdvice(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAgentLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner with Mode Toggle */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#170e2f] via-[#120c24] to-[#1e103d] border border-purple-500/25 p-6 md:p-8 shadow-xl shadow-purple-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-mono mb-3">
              <Calculator className="w-3.5 h-3.5 text-purple-400" />
              <span>{riskMode === "intermediate" ? "INTERMEDIATE PRACTICAL RISK SUITE" : "INSTITUTIONAL QUANT RISK SUITE • STOCHASTIC MODELING"}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-sans">
              {t.quant.title}
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed font-sans">
              {riskMode === "intermediate" ? t.quant.intermediateSubtitle : t.quant.subtitle}
            </p>
          </div>

          {/* Mode Switcher Pill */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0 bg-[#0c0919] p-2 rounded-2xl border border-purple-500/30">
            <span className="text-[11px] font-mono text-slate-400 px-2 uppercase">{t.quant.modeToggleLabel}:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setRiskMode("intermediate")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  riskMode === "intermediate"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.quant.modeIntermediate}
              </button>
              <button
                onClick={() => setRiskMode("advanced")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  riskMode === "advanced"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.quant.modeAdvanced}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Risk Presets for Intermediate Traders */}
      <div className="rounded-xl bg-[#110d24] border border-purple-500/25 p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-sans">
              {t.quant.profilePresets}:
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleApplyPreset("conservative")}
              className="px-3 py-1.5 rounded-lg text-xs font-sans font-medium bg-[#160f2e] hover:bg-purple-900/60 text-slate-200 border border-purple-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.quant.presetConservative}</span>
            </button>
            <button
              onClick={() => handleApplyPreset("balanced")}
              className="px-3 py-1.5 rounded-lg text-xs font-sans font-medium bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-purple-400" />
              <span>{t.quant.presetBalanced}</span>
            </button>
            <button
              onClick={() => handleApplyPreset("aggressive")}
              className="px-3 py-1.5 rounded-lg text-xs font-sans font-medium bg-[#160f2e] hover:bg-purple-900/60 text-slate-200 border border-purple-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.quant.presetAggressive}</span>
            </button>
          </div>
        </div>
      </div>

      {/* At-a-Glance Portfolio Risk Health Check (Simplified for Intermediate Traders) */}
      <div className="rounded-2xl bg-gradient-to-b from-[#150f2e] to-[#0e0a1f] border border-purple-500/30 p-5 md:p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-sans">
              {t.quant.healthCheckTitle}
            </h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${riskCategory.bg} ${riskCategory.color} ${riskCategory.border}`}>
            {riskCategory.label}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Normal Pullback Limit */}
          <div className="bg-[#0b0819] rounded-xl p-4 border border-purple-950/80 hover:border-purple-500/30 transition-all">
            <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
              <span>{t.quant.maxNormalLossTitle}</span>
              <span className="text-purple-400 font-bold">{horizonDays}d (95%)</span>
            </div>
            <div className="text-xl font-extrabold font-mono text-rose-400 my-1">
              -${Math.round(varDollar).toLocaleString()}
            </div>
            <div className="text-xs text-rose-300/80 font-mono">
              -{(varFraction * 100).toFixed(1)}% of capital
            </div>
            <p className="mt-2 text-[11px] text-slate-400 leading-relaxed font-sans">
              {language === "id"
                ? "95 dari 100 hari pergerakan pasar normal tidak akan melebihi penurunan ini."
                : "95 out of 100 normal trading periods will stay within this drawdown limit."}
            </p>
          </div>

          {/* Card 2: Extreme Crash Loss */}
          <div className="bg-[#0b0819] rounded-xl p-4 border border-purple-950/80 hover:border-purple-500/30 transition-all">
            <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
              <span>{t.quant.worstCaseCrashTitle}</span>
              <span className="text-amber-400 font-bold">Tail Risk</span>
            </div>
            <div className="text-xl font-extrabold font-mono text-amber-400 my-1">
              -${Math.round(cvarDollar).toLocaleString()}
            </div>
            <div className="text-xs text-amber-300/80 font-mono">
              -{(cvarFraction * 100).toFixed(1)}% in crash
            </div>
            <p className="mt-2 text-[11px] text-slate-400 leading-relaxed font-sans">
              {language === "id"
                ? "Estimasi rata-rata kerugian jika terjadi kejatuhan pasar ekstrem tak terduga."
                : "Expected average loss if an unexpected extreme market crash takes place."}
            </p>
          </div>

          {/* Card 3: Safe Trade Size */}
          <div className="bg-[#0b0819] rounded-xl p-4 border border-purple-500/80 shadow-md shadow-purple-950/30">
            <div className="text-[11px] font-mono text-purple-300 mb-1 flex items-center justify-between">
              <span>{t.quant.recommendedTradeSize}</span>
              <span className="text-emerald-400 font-bold">Half-Kelly</span>
            </div>
            <div className="text-xl font-extrabold font-mono text-emerald-400 my-1">
              {(halfKelly * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-emerald-300/80 font-mono">
              ${Math.round(capital * halfKelly).toLocaleString()} max per setup
            </div>
            <p className="mt-2 text-[11px] text-slate-300 leading-relaxed font-sans">
              {language === "id"
                ? "Batas alokasi maksimal per satu transaksi agar modal tumbuh konsisten tanpa risiko bangkrut."
                : "Maximum allocation for any single trade to steadily compound without risk of ruin."}
            </p>
          </div>

          {/* Card 4: Risk-Reward Efficiency */}
          <div className="bg-[#0b0819] rounded-xl p-4 border border-purple-950/80 hover:border-purple-500/30 transition-all">
            <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
              <span>{t.quant.riskRewardEfficiency}</span>
              <span className="text-cyan-400 font-bold">Sharpe</span>
            </div>
            <div className="text-xl font-extrabold font-mono text-cyan-300 my-1">
              {sharpeRatio.toFixed(2)}
            </div>
            <div className="text-xs text-cyan-400/80 font-mono">
              {sharpeRatio >= 1.5
                ? (language === "id" ? "Sangat Efisien 🌟" : "Institutional Grade 🌟")
                : sharpeRatio >= 1.0
                ? (language === "id" ? "Bagus 👍" : "Good & Profitable 👍")
                : (language === "id" ? "Perlu Ditingkatkan ⚠️" : "High Volatility ⚠️")}
            </div>
            <p className="mt-2 text-[11px] text-slate-400 leading-relaxed font-sans">
              {language === "id"
                ? "Semakin tinggi skor ini, semakin berkualitas keuntungan relatif terhadap volatilitas."
                : "Higher is better. Measures return earned per unit of market volatility endured."}
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio Parameters Controls Bar */}
      <div className="rounded-xl bg-[#110d24] border border-purple-500/25 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
              {t.quant.portfolioConfig}
            </h3>
          </div>
          <span className="text-xs font-mono text-purple-300">
            {language === "id" ? "Sesuaikan angka di bawah untuk melihat dampak risiko" : "Adjust inputs below to simulate risk impact"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          {/* Capital */}
          <div className="bg-[#090714] p-3 rounded-lg border border-purple-950">
            <label className="text-slate-400 block mb-1 font-sans font-medium">
              {t.quant.capitalLabel}
            </label>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-purple-400" />
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value) || 0)}
                className="w-full bg-transparent text-white font-bold text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Daily Volatility */}
          <div className="bg-[#090714] p-3 rounded-lg border border-purple-950">
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-400 font-sans font-medium">
                {t.quant.dailyVolLabel}:
              </label>
              <span className="text-purple-300 font-bold">{(dailyVol * 100).toFixed(1)}% / day</span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.05"
              step="0.001"
              value={dailyVol}
              onChange={(e) => setDailyVol(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Low (0.5%)</span>
              <span>Med (2.0%)</span>
              <span>High (5.0%)</span>
            </div>
          </div>

          {/* Confidence Level & Horizon */}
          <div className="bg-[#090714] p-3 rounded-lg border border-purple-950 flex flex-col justify-between">
            <label className="text-slate-400 block mb-1 font-sans font-medium">
              {t.quant.confidenceLevelLabel} & {t.quant.horizonLabel}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfidence(0.95)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                  confidence === 0.95
                    ? "bg-purple-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                95% (Normal)
              </button>
              <button
                onClick={() => setConfidence(0.99)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                  confidence === 0.99
                    ? "bg-purple-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                99% (Strict)
              </button>
              <select
                value={horizonDays}
                onChange={(e) => setHorizonDays(Number(e.target.value))}
                className="bg-slate-800 text-purple-300 rounded px-2 py-1 text-[11px] focus:outline-none cursor-pointer"
              >
                <option value={1}>1 Day</option>
                <option value={5}>5 Days</option>
                <option value={10}>10 Days</option>
                <option value={20}>20 Days</option>
              </select>
            </div>
          </div>

          {/* Win Rate & Win/Loss Payoff */}
          <div className="bg-[#090714] p-3 rounded-lg border border-purple-950 flex flex-col justify-between">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 font-sans font-medium">Win Rate & Payoff:</span>
              <span className="text-emerald-400 font-bold">{(winRate * 100).toFixed(0)}% • {winLossRatio.toFixed(1)}:1</span>
            </div>
            <input
              type="range"
              min="0.35"
              max="0.80"
              step="0.01"
              value={winRate}
              onChange={(e) => setWinRate(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer my-1"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Conservative (40%)</span>
              <span>Pro (56%)</span>
              <span>Elite (70%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Risk Modules (Interactive, Visual & Plain-English for Intermediate Traders) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module 1: Value at Risk (Normal Dip vs Extreme Crash) */}
        <div className="rounded-2xl bg-[#110d24] border border-purple-500/25 p-5 flex flex-col justify-between shadow-lg space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold text-white font-sans">
                  {t.quant.varSectionTitle}
                </h4>
              </div>
              <button
                onClick={() => setShowFormulas(!showFormulas)}
                className="text-[10px] font-mono text-purple-400 hover:text-purple-300 underline cursor-pointer"
              >
                {showFormulas ? t.quant.hideMathFormulas || "Hide Math" : t.quant.viewMathFormulas || "Show Math"}
              </button>
            </div>

            {/* Formula box (shown in advanced mode or when toggled) */}
            {(riskMode === "advanced" || showFormulas) && (
              <div className="bg-[#090714] rounded-xl p-3 border border-purple-500/30 my-3 font-mono text-center animate-fadeIn">
                <div className="text-xs text-purple-300 font-bold">
                  {t.quant.varFormula}
                </div>
                <div className="text-[11px] text-indigo-300 mt-1">
                  {t.quant.cvarFormula}
                </div>
              </div>
            )}

            {/* Plain English explanation */}
            <div className="p-3 rounded-xl bg-[#150f2e]/90 border border-purple-500/20 text-xs text-slate-200 font-sans space-y-2">
              <div className="flex items-center gap-1.5 text-purple-300 font-bold text-[11px] uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.quant.plainEnglishTakeaway}:</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                {language === "id"
                  ? `Jika Anda memegang portofolio $${capital.toLocaleString()} selama ${horizonDays} hari, Anda biasanya tidak akan rugi lebih dari $${Math.round(varDollar).toLocaleString()}. Namun jika terjadi crash pasar besar, kerugian rata-rata melonjak menjadi $${Math.round(cvarDollar).toLocaleString()}.`
                  : `If you hold your $${capital.toLocaleString()} portfolio for ${horizonDays} days, you normally won't lose more than $${Math.round(varDollar).toLocaleString()}. In a severe tail-risk crash, expected loss expands to $${Math.round(cvarDollar).toLocaleString()}.`}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-purple-950 font-mono">
            {/* Visual Risk Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Normal VaR Buffer:</span>
                <span className="text-rose-400 font-bold">{(varFraction * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-[#090714] rounded-full overflow-hidden border border-purple-950">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-rose-500 rounded-full"
                  style={{ width: `${Math.min(100, varFraction * 300)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#16102f]">
              <span className="text-xs text-slate-300">
                Normal Dip Limit (VaR):
              </span>
              <span className="text-sm font-extrabold text-rose-400">
                -${Math.round(varDollar).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#16102f]">
              <span className="text-xs text-slate-300">
                Severe Crash (Expected Shortfall):
              </span>
              <span className="text-sm font-extrabold text-amber-400">
                -${Math.round(cvarDollar).toLocaleString()}
              </span>
            </div>

            {/* Actionable Rule of thumb */}
            <div className="p-2.5 rounded-lg bg-[#0c0919] border border-purple-900/50 text-[11px] text-purple-300 font-sans">
              <strong className="text-white font-medium">🎯 {t.quant.actionableRule}:</strong>{" "}
              {language === "id"
                ? `Pasang batas stop-loss portofolio Anda di kisaran -$${Math.round(varDollar).toLocaleString()} agar tidak terkena kerugian tak terduga.`
                : `Set your collective portfolio stop-loss around -$${Math.round(varDollar).toLocaleString()} to protect capital against unexpected spirals.`}
            </div>
          </div>
        </div>

        {/* Module 2: Kelly Criterion (Safe Position Sizing) */}
        <div className="rounded-2xl bg-[#110d24] border border-purple-500/25 p-5 flex flex-col justify-between shadow-lg space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold text-white font-sans">
                  {t.quant.kellySectionTitle}
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-emerald-400 border border-purple-500/30">
                Anti-Ruin Sizing
              </span>
            </div>

            {/* Formula card */}
            {(riskMode === "advanced" || showFormulas) && (
              <div className="bg-[#090714] rounded-xl p-3 border border-purple-500/30 my-3 font-mono text-center animate-fadeIn">
                <div className="text-sm text-purple-300 font-bold">
                  {t.quant.kellyFormula}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  b={winLossRatio.toFixed(1)}, p={(winRate * 100).toFixed(0)}%, q={(q * 100).toFixed(0)}%
                </div>
              </div>
            )}

            {/* Plain English explanation */}
            <div className="p-3 rounded-xl bg-[#150f2e]/90 border border-purple-500/20 text-xs text-slate-200 font-sans space-y-2">
              <div className="flex items-center gap-1.5 text-purple-300 font-bold text-[11px] uppercase">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.quant.plainEnglishTakeaway}:</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                {language === "id"
                  ? `Berapa banyak uang yang boleh dipertaruhkan dalam satu trade? Full-Kelly (${(fullKelly * 100).toFixed(0)}%) terlalu volatil. Trader profesional memakai Setengah Kelly (${(halfKelly * 100).toFixed(1)}%), yaitu maksimal $${Math.round(capital * halfKelly).toLocaleString()} per posisi.`
                  : `How much capital should you risk on a single trade? Full Kelly (${(fullKelly * 100).toFixed(0)}%) is too aggressive. Professional quants use Half-Kelly (${(halfKelly * 100).toFixed(1)}%), allocating at most $${Math.round(capital * halfKelly).toLocaleString()} to grow safely.`}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-purple-950 font-mono">
            {/* Recommended Position Box */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-950/80 to-[#18113b] border border-purple-500/40">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-purple-300 font-bold block">{t.quant.halfKelly} (Recommended):</span>
                  <span className="text-[11px] text-slate-400">Optimal balance of growth & safety</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-emerald-400 block">
                    {(halfKelly * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs font-bold text-white">
                    ${Math.round(capital * halfKelly).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-[#16102f] border border-purple-950 text-slate-300 flex justify-between items-center">
                <span className="text-slate-400">{t.quant.fullKelly}:</span>
                <span className="font-bold text-slate-200">{(fullKelly * 100).toFixed(1)}%</span>
              </div>
              <div className="p-2 rounded bg-[#16102f] border border-purple-950 text-slate-300 flex justify-between items-center">
                <span className="text-slate-400">{t.quant.quarterKelly}:</span>
                <span className="font-bold text-slate-200">{(quarterKelly * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Actionable Rule */}
            <div className="p-2.5 rounded-lg bg-[#0c0919] border border-purple-900/50 text-[11px] text-purple-300 font-sans">
              <strong className="text-white font-medium">🎯 {t.quant.actionableRule}:</strong>{" "}
              {language === "id"
                ? `Sisihkan sisa modal ${(100 - halfKelly * 100).toFixed(0)}% ($${Math.round(capital * (1 - halfKelly)).toLocaleString()}) dalam aset kas atau diversifikasi lain.`
                : `Keep the remaining ${(100 - halfKelly * 100).toFixed(0)}% ($${Math.round(capital * (1 - halfKelly)).toLocaleString()}) safely buffered in cash or uncorrelated trades.`}
            </div>
          </div>
        </div>

        {/* Module 3: Sharpe & Sortino (Risk-Adjusted Efficiency) */}
        <div className="rounded-2xl bg-[#110d24] border border-purple-500/25 p-5 flex flex-col justify-between shadow-lg space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold text-white font-sans">
                  {t.quant.ratiosSectionTitle}
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                Quality of Gains
              </span>
            </div>

            {/* Formulas */}
            {(riskMode === "advanced" || showFormulas) && (
              <div className="bg-[#090714] rounded-xl p-3 border border-purple-500/30 my-3 font-mono text-center animate-fadeIn">
                <div className="text-xs text-purple-300 font-bold">
                  {t.quant.sharpeFormula}
                </div>
                <div className="text-xs text-emerald-300 mt-1 font-bold">
                  {t.quant.sortinoFormula}
                </div>
              </div>
            )}

            {/* Plain English explanation */}
            <div className="p-3 rounded-xl bg-[#150f2e]/90 border border-purple-500/20 text-xs text-slate-200 font-sans space-y-2">
              <div className="flex items-center gap-1.5 text-purple-300 font-bold text-[11px] uppercase">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.quant.plainEnglishTakeaway}:</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                {language === "id"
                  ? `Sharpe Ratio mengukur apakah keuntungan Anda berasal dari strategi cerdas atau sekadar mengambil risiko nekat. Skor di atas 1.0 berarti bagus, dan di atas 1.5 merupakan standar hedge fund profesional.`
                  : `Sharpe Ratio tells you whether profits come from genuine edge or just reckless gambling. A score above 1.0 is solid, while anything above 1.5 reaches top hedge fund efficiency.`}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-purple-950 font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#16102f]">
              <span className="text-xs text-slate-300">Sharpe Ratio:</span>
              <span
                className={`text-sm font-extrabold ${
                  sharpeRatio >= 1.5 ? "text-emerald-400" : sharpeRatio >= 1.0 ? "text-cyan-300" : "text-amber-400"
                }`}
              >
                {sharpeRatio.toFixed(2)} ({sharpeRatio >= 1.5 ? "Institutional" : sharpeRatio >= 1.0 ? "Good" : "Moderate"})
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#16102f]">
              <span className="text-xs text-slate-300">Sortino Ratio:</span>
              <span className="text-sm font-extrabold text-purple-300">
                {sortinoRatio.toFixed(2)} (Downside Penalized)
              </span>
            </div>

            {/* Actionable Rule */}
            <div className="p-2.5 rounded-lg bg-[#0c0919] border border-purple-900/50 text-[11px] text-purple-300 font-sans">
              <strong className="text-white font-medium">🎯 {t.quant.actionableRule}:</strong>{" "}
              {language === "id"
                ? "Sortino Anda lebih tinggi dari Sharpe, membuktikan sebagian besar volatilitas Anda adalah lonjakan ke atas (keuntungan)."
                : "Your Sortino ratio is healthy, confirming that the majority of your portfolio swings are profitable upside expansions."}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Scenario Stress Testing (Concrete Dollars & Clear Actions) */}
      <div className="rounded-xl bg-[#110d24] border border-purple-500/25 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
              {t.quant.stressTestTitle}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-purple-300 bg-purple-950/70 px-3 py-1 rounded-full border border-purple-500/30">
            {language === "id" ? `Modal Saat Ini: $${capital.toLocaleString()}` : `Current Capital: $${capital.toLocaleString()}`}
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4 font-sans leading-relaxed">
          {language === "id"
            ? "Pilih skenario krisis historis di bawah untuk melihat estimasi kerugian dalam dolar riil dan langkah lindung nilai praktis untuk melindungi akun Anda:"
            : "Select any historical crash scenario below to see the exact dollar loss on your capital and the practical hedge to prevent it:"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-sans">
          {scenarios.map((sc) => {
            const dollarLoss = Math.round(capital * Math.abs(sc.shock));
            const remaining = capital - dollarLoss;
            const isSelected = activeScenario === sc.id;

            return (
              <button
                key={sc.id}
                onClick={() => setActiveScenario(isSelected ? null : sc.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#1f143d] border-purple-400 shadow-md shadow-purple-600/30"
                    : "bg-[#0c0919] border-purple-950 hover:border-purple-500/40"
                }`}
              >
                <div className="text-xs font-bold text-white mb-1">{sc.title}</div>
                <div className="flex items-baseline justify-between text-xs font-mono my-1.5">
                  <span className="text-rose-400 font-extrabold">
                    {(sc.shock * 100).toFixed(1)}%
                  </span>
                  <span className="text-rose-300 text-[11px] font-bold">
                    Loss: -${dollarLoss.toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mb-2">
                  Remaining: ${remaining.toLocaleString()}
                </div>
                <div className="text-[11px] text-purple-300 font-mono bg-purple-950/60 p-2 rounded border border-purple-500/20">
                  <span className="text-slate-400 block text-[10px] font-sans">Protection Step:</span>
                  {sc.hedgeRequirement}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Quantitative Agent Consultation Chat (Intermediate-Friendly) */}
      <div className="rounded-2xl bg-gradient-to-br from-[#150f2f] via-[#100b24] to-[#1a113a] border border-purple-500/30 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-extrabold text-white font-sans">
              {t.quant.agentChatTitle}
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-purple-950 text-purple-300 border border-purple-500/30">
            {language === "id" ? "PENASIHAT RISIKO PRAKTIS" : "PRACTICAL RISK ADVISOR"}
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-4 font-sans leading-relaxed">
          {language === "id"
            ? "Tanyakan apa pun seputar ukuran posisi aman, stop loss, atau cara memproteksi modal Anda kepada AI Officer:"
            : "Ask the AI Risk Officer practical questions on safe position sizing, stop-loss rules, or hedging strategies:"}
        </p>

        {/* Quick sample prompt pills for intermediate traders */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() =>
              handleAskAgent(
                undefined,
                language === "id"
                  ? `Berapa batas risiko maksimal dalam dolar yang boleh saya pertaruhkan pada trade berikutnya dengan modal $${capital.toLocaleString()}?`
                  : `How much maximum dollar risk should I put on my next trade with my $${capital.toLocaleString()} capital?`
              )
            }
            className="px-3 py-1.5 rounded-lg bg-[#0e0a1f] hover:bg-purple-950 border border-purple-500/25 text-xs text-purple-200 transition-colors cursor-pointer"
          >
            {language === "id"
              ? "🎯 Berapa risiko aman per trade saya?"
              : "🎯 How much should I risk per trade?"}
          </button>
          <button
            onClick={() =>
              handleAskAgent(
                undefined,
                language === "id"
                  ? `Bagaimana cara termudah melindungi portofolio saya jika pasar mendadak turun 15%?`
                  : `What is the simplest way to protect my portfolio if the market suddenly drops 15%?`
              )
            }
            className="px-3 py-1.5 rounded-lg bg-[#0e0a1f] hover:bg-purple-950 border border-purple-500/25 text-xs text-purple-200 transition-colors cursor-pointer"
          >
            {language === "id"
              ? "🛡️ Lindung nilai praktis jika pasar drop 15%"
              : "🛡️ Practical hedge if market drops 15%"}
          </button>
          <button
            onClick={() =>
              handleAskAgent(
                undefined,
                language === "id"
                  ? `Jelaskan Value at Risk (VaR) dan Half-Kelly dengan bahasa sederhana yang mudah dipahami pemula.`
                  : `Explain Value at Risk (VaR) and Half-Kelly position sizing in simple terms for an intermediate trader.`
              )
            }
            className="px-3 py-1.5 rounded-lg bg-[#0e0a1f] hover:bg-purple-950 border border-purple-500/25 text-xs text-purple-200 transition-colors cursor-pointer"
          >
            {language === "id"
              ? "💡 Jelaskan VaR & Kelly secara sederhana"
              : "💡 Explain VaR & Kelly in simple terms"}
          </button>
        </div>

        {/* Input box */}
        <form onSubmit={handleAskAgent} className="flex gap-2">
          <input
            type="text"
            value={agentQuery}
            onChange={(e) => setAgentQuery(e.target.value)}
            placeholder={t.quant.agentPlaceholder}
            className="flex-1 rounded-xl bg-[#080613] border border-purple-500/30 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={agentLoading || !agentQuery.trim()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all cursor-pointer shrink-0"
          >
            {agentLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{agentLoading ? t.quant.askingAgent : t.quant.askAgentBtn}</span>
          </button>
        </form>

        {/* Agent Response Box */}
        {agentAdvice && (
          <div className="mt-5 p-5 rounded-xl bg-[#0a0717] border border-purple-500/40 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-purple-900/40">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-purple-300 uppercase">
                  {language === "id" ? "Rekomendasi Petugas Risiko Kuantitatif" : "Quantitative Risk Officer Assessment"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400">
                  {t.quant.suggestedHedgeRatio}:{" "}
                  <strong className="text-purple-300">
                    {agentAdvice.suggestedHedgeRatio}
                  </strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 font-bold">
                  {t.quant.riskLevel}: {agentAdvice.riskLevel}
                </span>
              </div>
            </div>

            <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
              {language === "id"
                ? agentAdvice.responseId || agentAdvice.responseEn
                : agentAdvice.responseEn}
            </div>

            {agentAdvice.formulaUsed && (
              <div className="mt-3 text-xs font-mono text-purple-400/80 bg-purple-950/40 px-3 py-1.5 rounded-lg border border-purple-900/30">
                Methodology: {agentAdvice.formulaUsed}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
