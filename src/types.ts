export type Language = "en" | "id";

export interface FinBertScores {
  positive: number;
  neutral: number;
  negative: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  sourceUrl?: string;
  author?: string;
  sourceBadge?: string;
  timestamp: string;
  category: string;
  finbert: {
    sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
    scores: FinBertScores;
    marketImpactScore: number; // 0.0 to 10.0
    affectedAssets: string[];
    macroSummaryEn: string;
    macroSummaryId: string;
    hedgeActionEn: string;
    hedgeActionId: string;
  };
}

export interface ChartAnalysisResult {
  asset: string;
  timeframe: string;
  prediction: "BULLISH" | "BEARISH" | "NEUTRAL";
  confidence: number;
  pattern: string;
  trend: string;
  keyLevels: {
    support: string;
    resistance: string;
    invalidation: string;
  };
  tradeSetup: {
    bias: "LONG" | "SHORT" | "WAIT";
    entryZone: string;
    takeProfit1: string;
    takeProfit2: string;
    stopLoss: string;
    riskRewardRatio: string;
  };
  indicatorsAnalysis?: {
    rsi?: string;
    movingAverages?: string;
    volumeProfile?: string;
  };
  hedgeAdvisoryEn: string;
  hedgeAdvisoryId: string;
  executiveSummaryEn: string;
  executiveSummaryId: string;
}

export interface MacroChartAnalysisResult {
  asset: string;
  confluenceScore: number;
  macroRegime: "STRONG_BULLISH" | "BULLISH_CORRECTION" | "NEUTRAL_RANGE" | "BEARISH_DISTRIBUTION" | "STRONG_BEARISH";
  monthly1M: {
    trend: string;
    multiYearCycle: string;
    macroLiquidityAnchor: string;
    structuralSupport: string;
    structuralResistance: string;
    monthlyCandleContext: string;
  };
  weekly1W: {
    trend: string;
    secularRegime: string;
    institutionalLiquidity: string;
    majorSupport: string;
    majorResistance: string;
    weeklyCandleContext: string;
  };
  daily1D: {
    trend: string;
    marketStructure: string;
    dailyOrderBlock: string;
    fairValueGap: string;
    immediateSupport: string;
    immediateResistance: string;
    momentumRSI: string;
  };
  confluenceSummaryEn: string;
  confluenceSummaryId: string;
  macroTradePlan: {
    bias: "LONG" | "SHORT" | "ACCUMULATE" | "WAIT";
    macroEntryZone: string;
    swingTarget1: string;
    swingTarget2: string;
    macroInvalidation: string;
    riskRewardRatio: string;
  };
  macroHedgeAdvisoryEn: string;
  macroHedgeAdvisoryId: string;
}

export interface QuantMetrics {
  capital: number;
  volatilityDaily: number;
  confidenceLevel: 0.95 | 0.99;
  holdingDays: number;
  winRate: number; // e.g. 0.58
  winLossRatio: number; // e.g. 2.1
  riskFreeRate: number; // e.g. 0.045
  portfolioReturn: number; // e.g. 0.18
  downsideDeviation: number; // e.g. 0.09
  maxPeak: number;
  trough: number;
}

export interface QuantAgentAdvice {
  responseEn: string;
  responseId: string;
  suggestedHedgeRatio: string;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  formulaUsed?: string;
}

export interface SystemLiveTicker {
  key: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  formattedPrice: string;
  formattedChange: string;
  isPositive: boolean;
  category: "Crypto" | "Forex" | "Equities" | "Indices" | "Bonds" | "Commodities";
  marketStatus: "OPEN_24_7" | "MARKET_OPEN" | "WEEKEND_CLOSED" | "MARKET_CLOSED";
  isMarketOpen: boolean;
  isWeekend: boolean;
  statusBadgeEn: string;
  statusBadgeId: string;
  heldSettlement: boolean;
}

export interface SystemLivePayload {
  success: boolean;
  serverTime: string;
  isWeekend: boolean;
  tickers: SystemLiveTicker[];
  latencyMs: number;
}

export interface MarketStatusInfo {
  status: "OPEN_24_7" | "MARKET_OPEN" | "WEEKEND_CLOSED" | "MARKET_CLOSED";
  isMarketOpen: boolean;
  isWeekend: boolean;
  badgeLabelEn: string;
  badgeLabelId: string;
  descriptionEn: string;
  descriptionId: string;
}
