import React, { useState, useEffect } from "react";
import { Language, SystemLiveTicker } from "../types";
import { translations } from "../translations";
import { ShieldCheck, Activity, Globe, Sparkles, TrendingUp, Cpu, RefreshCw } from "lucide-react";

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: "news" | "chart" | "quant";
  onTabChange: (tab: "news" | "chart" | "quant") => void;
}

const DEFAULT_TICKERS: SystemLiveTicker[] = [
  {
    key: "sp500",
    symbol: "^GSPC",
    name: "S&P 500",
    price: 7650.5,
    change: -6.48,
    changePercent: -0.08,
    formattedPrice: "7,650.50",
    formattedChange: "-0.08%",
    isPositive: false,
    category: "Indices",
    marketStatus: "WEEKEND_CLOSED",
    isMarketOpen: false,
    isWeekend: true,
    statusBadgeEn: "WEEKEND / CLOSED",
    statusBadgeId: "AKHIR PEKAN / TUTUP",
    heldSettlement: true,
  },
  {
    key: "nasdaq",
    symbol: "^IXIC",
    name: "NASDAQ",
    price: 26522.55,
    change: 189.5,
    changePercent: 0.72,
    formattedPrice: "26,522.55",
    formattedChange: "+0.72%",
    isPositive: true,
    category: "Indices",
    marketStatus: "WEEKEND_CLOSED",
    isMarketOpen: false,
    isWeekend: true,
    statusBadgeEn: "WEEKEND / CLOSED",
    statusBadgeId: "AKHIR PEKAN / TUTUP",
    heldSettlement: true,
  },
  {
    key: "btc",
    symbol: "BTC-USD",
    name: "BTC/USD",
    price: 81205.48,
    change: 5592.97,
    changePercent: 7.4,
    formattedPrice: "$81,205.48",
    formattedChange: "+7.40%",
    isPositive: true,
    category: "Crypto",
    marketStatus: "OPEN_24_7",
    isMarketOpen: true,
    isWeekend: true,
    statusBadgeEn: "24/7 LIVE STREAM",
    statusBadgeId: "STREAM 24/7 AKTIF",
    heldSettlement: false,
  },
  {
    key: "us10y",
    symbol: "^TNX",
    name: "US 10Y Yield",
    price: 5.0,
    change: 0.04,
    changePercent: 0.75,
    formattedPrice: "5.00%",
    formattedChange: "+4 bps (+0.75%)",
    isPositive: true,
    category: "Bonds",
    marketStatus: "WEEKEND_CLOSED",
    isMarketOpen: false,
    isWeekend: true,
    statusBadgeEn: "WEEKEND / CLOSED",
    statusBadgeId: "AKHIR PEKAN / TUTUP",
    heldSettlement: true,
  },
  {
    key: "idr",
    symbol: "USDIDR=X",
    name: "USD/IDR",
    price: 17735,
    change: 105,
    changePercent: 0.6,
    formattedPrice: "Rp 17,735",
    formattedChange: "+0.60%",
    isPositive: true,
    category: "Forex",
    marketStatus: "WEEKEND_CLOSED",
    isMarketOpen: false,
    isWeekend: true,
    statusBadgeEn: "WEEKEND / CLOSED",
    statusBadgeId: "AKHIR PEKAN / TUTUP",
    heldSettlement: true,
  },
];

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  activeTab,
  onTabChange,
}) => {
  const t = translations[language];
  const [tickers, setTickers] = useState<SystemLiveTicker[]>(DEFAULT_TICKERS);
  const [latency, setLatency] = useState<number>(18);
  const [isWeekend, setIsWeekend] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  const fetchSystemLive = async () => {
    try {
      setIsRefreshing(true);
      const t0 = performance.now();
      const res = await fetch("/api/market/system-live");
      const clientLatency = Math.round(performance.now() - t0);
      if (res.ok) {
        const data = await res.json();
        if (data.tickers && data.tickers.length > 0) {
          setTickers(data.tickers);
          setIsWeekend(Boolean(data.isWeekend));
          setLatency(Math.max(8, clientLatency));
          setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        }
      }
    } catch (err) {
      console.warn("Error syncing system live ticker:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSystemLive();
    const timer = setInterval(fetchSystemLive, 12000); // refresh every 12 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-purple-500/20 bg-[#0d0a1a]/90 backdrop-blur-md">
      {/* Top micro-ticker bar */}
      <div className="hidden md:flex items-center justify-between px-6 py-1.5 border-b border-purple-900/30 bg-[#090714] text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 text-purple-300 shrink-0">
            <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span className="font-semibold text-white tracking-wider">{t.nav.tagline}</span>
            <span className="text-purple-500/60">•</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              {t.nav.status}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            {tickers.map((ticker) => {
              const isCrypto = ticker.category === "Crypto";
              const label =
                ticker.key === "sp500"
                  ? t.headerTicker.sp500
                  : ticker.key === "nasdaq"
                  ? t.headerTicker.nasdaq
                  : ticker.key === "btc"
                  ? t.headerTicker.btc
                  : ticker.key === "us10y"
                  ? t.headerTicker.us10y
                  : t.headerTicker.idr;

              return (
                <div
                  key={ticker.key}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                  title={`${ticker.name} - ${ticker.heldSettlement ? (language === "id" ? "Bursa Tutup (Akhir Pekan/Libur) • Harga Penutupan Resmi" : "Market Closed (Weekend/Off-day) • Official Settlement Held") : "24/7 Real-Time Live Feed"}`}
                >
                  <span className="text-slate-400 font-medium">{label}:</span>
                  <strong className={ticker.isPositive ? "text-emerald-400" : "text-rose-400"}>
                    {ticker.formattedPrice} ({ticker.formattedChange})
                  </strong>
                  {ticker.heldSettlement ? (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-amber-950/60 border border-amber-500/30 text-amber-300" title={language === "id" ? "Pasar Tutup di Akhir Pekan" : "Market Closed (Weekend)"}>
                      {language === "id" ? "TUTUP" : "CLOSED"}
                    </span>
                  ) : isCrypto ? (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 animate-pulse">
                      24/7
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 text-slate-400">
          {isWeekend && (
            <span className="hidden xl:inline px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/50 text-purple-300 border border-purple-800/40">
              {language === "id" ? "AKHIR PEKAN: KRIPTO 24/7 LIVE • SAHAM/VALAS HARGA RESMI" : "WEEKEND: 24/7 CRYPTO LIVE • TRADITIONAL SETTLED"}
            </span>
          )}

          <button
            onClick={fetchSystemLive}
            className="flex items-center gap-1 text-purple-400 hover:text-purple-200 transition-colors cursor-pointer"
            title="Refresh Live Market Data"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-purple-300" : ""}`} />
            <span className="text-emerald-400 font-mono text-xs">
              {latency}ms
            </span>
          </button>

          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>FinBERT v2 + Gemini 3.8</span>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-800 shadow-lg shadow-purple-600/30 border border-purple-400/40">
              <TrendingUp className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0d0a1a]"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white font-sans">
                  Fin<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-300">Annual</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30">
                  {t.nav.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Institutional AI Hedge System for Global & Emerging Markets
              </p>
            </div>
          </div>

          {/* Language selector on mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => onLanguageChange(language === "en" ? "id" : "en")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-950/50 hover:bg-purple-900/50 text-purple-200 border border-purple-500/30 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>{language === "en" ? "ID" : "EN"}</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-[#15102a] p-1 rounded-xl border border-purple-500/20 shadow-inner w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => onTabChange("news")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeTab === "news"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-300 hover:text-white hover:bg-purple-900/20"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>{t.nav.newsTab}</span>
          </button>

          <button
            onClick={() => onTabChange("chart")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeTab === "chart"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-300 hover:text-white hover:bg-purple-900/20"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-purple-300" />
            <span>{t.nav.chartTab}</span>
          </button>

          <button
            onClick={() => onTabChange("quant")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeTab === "quant"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-300 hover:text-white hover:bg-purple-900/20"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
            <span>{t.nav.quantTab}</span>
          </button>
        </div>

        {/* Desktop Language Switcher */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center bg-[#130f26] rounded-lg p-1 border border-purple-500/20">
            <button
              onClick={() => onLanguageChange("en")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                language === "en"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-purple-200"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange("id")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                language === "id"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-purple-200"
              }`}
            >
              ID
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
