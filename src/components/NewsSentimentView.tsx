import React, { useState, useEffect } from "react";
import { NewsItem, Language } from "../types";
import { translations } from "../translations";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Zap,
  Shield,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Radio,
  Globe,
  Rss
} from "lucide-react";

interface NewsSentimentViewProps {
  language: Language;
}

export const NewsSentimentView: React.FC<NewsSentimentViewProps> = ({ language }) => {
  const t = translations[language];

  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [customHeadline, setCustomHeadline] = useState("");
  const [customSource, setCustomSource] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Fetch real-time live breaking news stack from backend RSS wire engine
  const fetchNews = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const url = forceRefresh ? "/api/news?refresh=true" : "/api/news";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.news && Array.isArray(data.news)) {
          const sorted = [...data.news].sort(
            (a, b) => b.finbert.marketImpactScore - a.finbert.marketImpactScore
          );
          setNewsList(sorted);
          if (data.lastUpdated) {
            const date = new Date(data.lastUpdated);
            setLastUpdatedTime(
              date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
            );
          }
        }
      }
    } catch (err) {
      console.error("Failed to load real-time news wire:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Filter items by category
  const filteredNews = newsList.filter((item) => {
    if (selectedCategory === "ALL") return true;
    const cat = (item.category || "").toLowerCase();
    if (selectedCategory === "MACRO") {
      return cat.includes("rates") || cat.includes("central") || cat.includes("macro") || cat.includes("forex");
    }
    if (selectedCategory === "TECH") {
      return cat.includes("tech") || cat.includes("ai");
    }
    if (selectedCategory === "CRYPTO") {
      return cat.includes("crypto") || cat.includes("digital");
    }
    if (selectedCategory === "EQUITIES") {
      return cat.includes("equities") || cat.includes("earnings") || cat.includes("commodities") || cat.includes("logistics");
    }
    return true;
  });

  // Reliable source URL resolver ensuring live active destinations
  const resolveSourceUrl = (item: NewsItem): string => {
    if (item.sourceUrl && item.sourceUrl.startsWith("http")) return item.sourceUrl;
    const s = (item.source || "").toLowerCase();
    if (s.includes("cnbc")) return "https://www.cnbc.com/markets/";
    if (s.includes("marketwatch") || s === "mw") return "https://www.marketwatch.com/investing";
    if (s.includes("cointelegraph") || s === "ct") return "https://cointelegraph.com/news";
    if (s.includes("bloomberg") || s === "bbg") return "https://www.bloomberg.com/markets";
    if (s.includes("reuters") || s === "rtrs") return "https://www.reuters.com/markets/";
    if (s.includes("bank indonesia") || s === "bi") return "https://www.bi.go.id/id/publikasi/ruang-media/news-release/";
    return "https://www.google.com/finance";
  };

  // Handle custom news analysis
  const handleAnalyzeCustomNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHeadline.trim()) return;

    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch("/api/news/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: customHeadline,
          source: customSource.trim() || undefined,
          sourceUrl: customUrl.trim() || undefined,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error("Analysis failed. Please check your connection.");
      }

      const analyzedItem: NewsItem = await res.json();
      // Add to top of stack and re-sort by market impact
      setNewsList((prev) => {
        const updated = [analyzedItem, ...prev];
        return updated.sort(
          (a, b) => b.finbert.marketImpactScore - a.finbert.marketImpactScore
        );
      });
      setCustomHeadline("");
      setCustomSource("");
      setCustomUrl("");
    } catch (err: any) {
      setAnalysisError(err.message || "Failed to analyze headline.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Calculate market sentiment bias across the news stack
  const totalNews = newsList.length;
  const bullishCount = newsList.filter((n) => n.finbert.sentiment === "BULLISH").length;
  const bearishCount = newsList.filter((n) => n.finbert.sentiment === "BEARISH").length;
  const neutralCount = newsList.filter((n) => n.finbert.sentiment === "NEUTRAL").length;

  const sentimentRatio = totalNews > 0 ? (bullishCount - bearishCount) / totalNews : 0;
  // -1 to 1 mapped to 0 to 100
  const sentimentMeter = Math.round(((sentimentRatio + 1) / 2) * 100);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Overview */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#170e2f] via-[#120c24] to-[#1e103d] border border-purple-500/25 p-6 md:p-8 shadow-xl shadow-purple-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>FINBERT INSTITUTIONAL NLP ENGINE</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-sans">
              {t.news.title}
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {t.news.subtitle}
            </p>
          </div>

          {/* Sentiment Aggregator Gauge */}
          <div className="bg-[#0b0817]/80 rounded-xl border border-purple-500/30 p-4 shrink-0 min-w-[280px]">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-400 uppercase">{t.news.fearGreedTitle}</span>
              <span className="font-bold text-purple-300">{sentimentMeter} / 100</span>
            </div>

            {/* Visual bar */}
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${sentimentMeter}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono mt-2">
              <span className="text-rose-400 font-medium">Bearish Hedge</span>
              <span className="text-purple-300 font-semibold">
                {sentimentRatio > 0.15
                  ? t.news.bullishTilt
                  : sentimentRatio < -0.15
                  ? t.news.bearishTilt
                  : t.news.neutralTilt}
              </span>
              <span className="text-emerald-400 font-medium">Risk-On Bull</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Custom News Analyzer Box */}
      <div className="rounded-xl bg-[#110d24] border border-purple-500/20 p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white font-sans">
            {t.news.customAnalyzeTitle}
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          {t.news.customAnalyzeDesc}
        </p>

        <form onSubmit={handleAnalyzeCustomNews} className="space-y-3">
          <div className="relative">
            <textarea
              rows={2}
              value={customHeadline}
              onChange={(e) => setCustomHeadline(e.target.value)}
              placeholder={t.news.inputPlaceholder}
              className="w-full rounded-lg bg-[#090714] border border-purple-500/30 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all font-sans resize-none"
            />
          </div>

          {/* Optional Source and URL inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              value={customSource}
              onChange={(e) => setCustomSource(e.target.value)}
              placeholder="Source name (e.g. Bloomberg, Reuters, CNBC)"
              className="w-full rounded-lg bg-[#090714] border border-purple-500/20 px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
            />
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Article source link URL (https://...)"
              className="w-full rounded-lg bg-[#090714] border border-purple-500/20 px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
            />
          </div>

          {analysisError && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 border border-rose-500/30 rounded-lg p-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{analysisError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-purple-400/70">
              <Shield className="w-3.5 h-3.5" />
              <span>BERT Multi-head Financial Attention Model</span>
            </div>

            <button
              type="submit"
              disabled={analyzing || !customHeadline.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold tracking-wide bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-600/30 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.news.analyzing}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.news.analyzeBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Real-time Live News Wire Header & Filter Bar */}
      <div className="space-y-3 border-b border-purple-500/20 pb-4">
        {/* Status banner with live pulse */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#140f2a] border border-purple-500/30">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="text-xs font-bold font-mono tracking-wide text-emerald-400">
                {t.news.liveNewsFeedConnected}
              </span>
              {lastUpdatedTime && (
                <span className="text-[11px] font-mono text-slate-400">
                  (Updated {lastUpdatedTime})
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => fetchNews(true)}
            disabled={isRefreshing || loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-purple-900/60 hover:bg-purple-800 text-purple-200 hover:text-white border border-purple-500/40 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? t.news.refreshing : t.news.refreshBtn}</span>
          </button>
        </div>

        {/* Category Filter Pills & Items Count */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL", label: t.news.filterAll },
              { id: "MACRO", label: t.news.filterMacro },
              { id: "TECH", label: t.news.filterTech },
              { id: "CRYPTO", label: t.news.filterCrypto },
              { id: "EQUITIES", label: t.news.filterEquities },
            ].map((tab) => {
              const active = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    active
                      ? "bg-purple-600 text-white font-bold shadow-sm shadow-purple-500/30 border border-purple-400"
                      : "bg-[#140e28] text-slate-300 hover:text-white hover:bg-purple-950/70 border border-purple-500/20"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>
              {filteredNews.length} / {newsList.length} stories
            </span>
          </div>
        </div>
      </div>

      {/* Stack of Top List Most Breaking News */}
      {loading && newsList.length === 0 ? (
        <div className="py-16 text-center text-slate-400 font-mono text-sm">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400 mb-2" />
          <span>Evaluating FinBERT weights and ranking market impact...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNews.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs rounded-xl bg-[#110d24] border border-purple-500/20">
              <span>No live stories matching this category in current wire cache. Try selecting "All Feeds" or clicking "Refresh Live Feed".</span>
            </div>
          ) : (
            filteredNews.map((item, index) => {
              const sentiment = item.finbert.sentiment;
              const isBullish = sentiment === "BULLISH";
              const isBearish = sentiment === "BEARISH";
              const resolvedLink = resolveSourceUrl(item);

              const macroSummary =
                language === "id"
                  ? item.finbert.macroSummaryId || item.finbert.macroSummaryEn
                  : item.finbert.macroSummaryEn;

              const hedgeAction =
                language === "id"
                  ? item.finbert.hedgeActionId || item.finbert.hedgeActionEn
                  : item.finbert.hedgeActionEn;

              return (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-xl bg-[#110d24]/90 border border-purple-500/20 hover:border-purple-400/50 p-5 md:p-6 transition-all duration-200 shadow-md hover:shadow-purple-900/20"
                >
                  {/* Ranking number pill */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-md bg-purple-950 text-purple-300 font-mono text-xs font-bold border border-purple-500/40">
                        #{index + 1}
                      </span>

                      {/* Source Publisher Badge with Direct Live Wire Link */}
                      <a
                        href={resolvedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-purple-900/60 hover:bg-purple-800 text-purple-200 hover:text-white border border-purple-500/30 transition-colors"
                        title={`Open live article on ${item.source}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {item.source}
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </a>

                      {item.author && (
                        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                          By {item.author}
                        </span>
                      )}

                      <span className="text-xs font-mono text-slate-400">
                        • {item.timestamp}
                      </span>

                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.category}
                      </span>
                    </div>

                    {/* Market Impact Badge & Source Action */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* View Source Article Link Button */}
                      <a
                        href={resolvedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-purple-950/90 hover:bg-purple-800 text-purple-200 hover:text-white border border-purple-500/40 transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
                        title={resolvedLink}
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{t.news.viewArticleSource}</span>
                        <ExternalLink className="w-3 h-3 text-purple-400" />
                      </a>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/90 border border-purple-400/40 text-purple-200 text-xs font-mono">
                        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{t.news.impactScore}:</span>
                        <strong className="text-white">
                          {item.finbert.marketImpactScore.toFixed(1)}/10
                        </strong>
                      </div>

                      {/* Sentiment Pill */}
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide ${
                          isBullish
                            ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                            : isBearish
                            ? "bg-rose-950/80 text-rose-300 border border-rose-500/40"
                            : "bg-purple-950/80 text-purple-300 border border-purple-500/40"
                        }`}
                      >
                        {isBullish ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : isBearish ? (
                          <TrendingDown className="w-3.5 h-3.5" />
                        ) : (
                          <Minus className="w-3.5 h-3.5" />
                        )}
                        <span>{sentiment}</span>
                      </div>
                    </div>
                  </div>

                  {/* News Headline with Direct Live Link */}
                  <h4 className="text-base md:text-lg font-bold text-white group-hover:text-purple-200 transition-colors leading-snug mb-3 font-sans">
                    <a
                      href={resolvedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline underline-offset-4"
                    >
                      {item.title}
                    </a>
                  </h4>

                  {/* FinBERT Probability Breakdown Bar */}
                  <div className="bg-[#090714] rounded-lg p-3 border border-purple-950 mb-4">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                      <span>{t.news.confidenceScores}:</span>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400">
                          {t.news.positive}: {(item.finbert.scores.positive * 100).toFixed(0)}%
                        </span>
                        <span className="text-purple-300">
                          {t.news.neutral}: {(item.finbert.scores.neutral * 100).toFixed(0)}%
                        </span>
                        <span className="text-rose-400">
                          {t.news.negative}: {(item.finbert.scores.negative * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Multi-color segment bar */}
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${item.finbert.scores.positive * 100}%` }}
                        title={`Positive: ${(item.finbert.scores.positive * 100).toFixed(0)}%`}
                      ></div>
                      <div
                        className="bg-purple-500 h-full"
                        style={{ width: `${item.finbert.scores.neutral * 100}%` }}
                        title={`Neutral: ${(item.finbert.scores.neutral * 100).toFixed(0)}%`}
                      ></div>
                      <div
                        className="bg-rose-500 h-full"
                        style={{ width: `${item.finbert.scores.negative * 100}%` }}
                        title={`Negative: ${(item.finbert.scores.negative * 100).toFixed(0)}%`}
                      ></div>
                    </div>
                  </div>

                  {/* Effects on Market (Easy Comprehension) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
                    <div className="md:col-span-8 bg-[#16102e]/70 rounded-lg p-3.5 border border-purple-500/20">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 font-sans mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>{t.news.macroEffect}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {macroSummary}
                      </p>
                    </div>

                    <div className="md:col-span-4 bg-[#16102e]/70 rounded-lg p-3.5 border border-purple-500/20 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                          <Shield className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{t.news.hedgeAction}</span>
                        </div>
                        <p className="text-xs text-purple-200 font-sans">
                          {hedgeAction}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Affected Assets Tickers */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-purple-950/80 text-xs font-mono">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-400">{t.news.affectedAssets}:</span>
                      {item.finbert.affectedAssets.map((ticker) => (
                        <span
                          key={ticker}
                          className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30 text-[11px] font-semibold"
                        >
                          {ticker}
                        </span>
                      ))}
                    </div>

                    <a
                      href={resolvedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] text-purple-400 hover:text-purple-200 transition-colors group/link ml-auto"
                    >
                      <span className="underline underline-offset-2">{t.news.articleSource}: {item.source}</span>
                      <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
