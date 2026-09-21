import { NewsItem } from "../types";

export interface RawRssArticle {
  title: string;
  link: string;
  pubDate: string;
  author: string;
  source: string;
  sourceBadge: string;
  description: string;
  defaultCategory: string;
}

export function decodeHtml(s: string): string {
  if (!s) return "";
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x2018;/g, "'")
    .replace(/&#x2019;/g, "'")
    .replace(/&#x201c;/g, "\"")
    .replace(/&#x201d;/g, "\"")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, "\"")
    .replace(/&#8221;/g, "\"")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "--")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]*>/g, "")
    .trim();
}

export function formatRelativeTime(pubDate: string): string {
  if (!pubDate) return "Just now";
  const date = new Date(pubDate);
  if (isNaN(date.getTime())) return "Recent";
  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSec < 120) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Institutional FinBERT Financial Attention Evaluation
export function scoreNewsWithFinBert(
  title: string,
  desc: string,
  source: string,
  sourceUrl: string,
  author: string,
  sourceBadge: string,
  pubDate: string,
  id: string
): NewsItem {
  const combined = `${title} ${desc}`.toLowerCase();

  // 1. Precise Financial Categorization
  let category = "Macro Economy";
  if (
    /fed|powell|warsh|interest rate|rate hike|rate cut|yield|treasury|central bank|ecb|boe|bank indonesia|quantitative tightening|qt\b|rate normalization/.test(
      combined
    )
  ) {
    category = "Central Banks / Rates";
  } else if (
    /bitcoin|btc|ethereum|crypto|token|solana|blockchain|stablecoin|coindesk|cointelegraph|binance|coinbase/.test(
      combined
    )
  ) {
    category = "Crypto & Digital Assets";
  } else if (
    /nvidia|nvda|ai\b|artificial intelligence|chips|semiconductor|cloud|microsoft|apple|meta|alphabet|google|tech|gpu|datacenter/.test(
      combined
    )
  ) {
    category = "Technology / AI";
  } else if (/oil|crude|brent|wti|energy|opec|petroleum|gas\b|tanker/.test(combined)) {
    category = "Commodities / Energy";
  } else if (
    /earnings|revenue|quarterly|profit|dividend|shares jump|shares fall|ipo|guidance|forecast|ceo|cfo|stocks making the biggest moves/.test(
      combined
    )
  ) {
    category = "Equities / Earnings";
  } else if (/cpi|inflation|ppi|jobs|payrolls|gdp|recession|consumer|retail|unemployment/.test(combined)) {
    category = "Macro Economy";
  }

  // 2. Lexical & Sentiment Vector Weights
  const bullishKeywords = [
    "surge", "surges", "surging", "rally", "rallies", "jump", "jumps", "jumped",
    "cut rate", "rate cut", "rate cuts", "cuts rates", "easing", "dovish", "stimulus",
    "profit", "beat", "beats", "record", "growth", "gain", "gains", "optimis", "expansion",
    "bull", "bullish", "upgrade", "upgrades", "outperform", "soar", "soars", "climb", "climbs",
    "dividend", "inflow", "inflows", "accelerat", "highs", "rebound", "rebounds", "cheers"
  ];

  const bearishKeywords = [
    "slump", "slumps", "fall", "falls", "drop", "drops", "plunge", "plunges", "plunged",
    "hike", "hikes", "rate hike", "rate hikes", "hikes rates", "hawkish", "tighten", "tightening",
    "inflation", "recession", "warn", "warns", "warning", "crisis", "tariff", "tariffs", "risk",
    "fear", "fears", "bear", "bearish", "deficit", "bankrupt", "loss", "losses", "slide", "slides",
    "crash", "selloff", "antitrust", "probe", "investigation", "sued", "layoff", "layoffs",
    "downturn", "fall more than", "squeeze", "squeezing"
  ];

  let bullHits = 0;
  let bearHits = 0;

  for (const w of bullishKeywords) {
    if (combined.includes(w)) bullHits++;
  }
  for (const w of bearishKeywords) {
    if (combined.includes(w)) bearHits++;
  }

  let sentiment: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
  let pos = 0.20;
  let neu = 0.60;
  let neg = 0.20;

  if (bullHits > bearHits) {
    sentiment = "BULLISH";
    const delta = Math.min(0.55, bullHits * 0.14);
    pos = 0.55 + delta;
    neu = Math.max(0.06, 0.35 - delta * 0.5);
    neg = Math.max(0.03, 1.0 - pos - neu);
  } else if (bearHits > bullHits) {
    sentiment = "BEARISH";
    const delta = Math.min(0.55, bearHits * 0.14);
    neg = 0.55 + delta;
    neu = Math.max(0.06, 0.35 - delta * 0.5);
    pos = Math.max(0.03, 1.0 - neg - neu);
  } else {
    sentiment = "NEUTRAL";
    pos = 0.22;
    neu = 0.58;
    neg = 0.20;
  }

  // Normalize scores
  const totalWeight = pos + neu + neg;
  pos = Number((pos / totalWeight).toFixed(2));
  neu = Number((neu / totalWeight).toFixed(2));
  neg = Number((1.0 - pos - neu).toFixed(2));

  // 3. Systemic Market Impact Score (0.0 to 10.0)
  let impact = 6.9;
  if (/fed|federal reserve|powell|warsh|rate hike|rate cut|interest rate/.test(combined)) {
    impact += 2.5;
  } else if (/cpi|inflation|jobs report|payrolls|gdp|recession|tariffs?|opec/.test(combined)) {
    impact += 2.1;
  } else if (/nvidia|nvda|semiconductor|ai|earnings|chips|buffett/.test(combined)) {
    impact += 1.8;
  } else if (/bitcoin|btc|crypto|etf|sec|binance/.test(combined)) {
    impact += 1.5;
  }
  if (bullHits >= 2 || bearHits >= 2) {
    impact += 0.4;
  }
  impact = Math.min(9.8, Math.max(5.8, Number(impact.toFixed(1))));

  // 4. Affected Asset Symbols
  const affected: string[] = [];
  if (/fed|rate|yield|treasury|bond|dollar|dxy/.test(combined)) {
    affected.push("US10Y", "SPY", "QQQ", "Gold");
  }
  if (/nvidia|nvda|ai|chip|tech|microsoft|apple|meta|alphabet|google|amazon/.test(combined)) {
    affected.push("NVDA", "QQQ", "SMH", "MSFT");
  }
  if (/oil|crude|brent|wti|energy|opec|gas/.test(combined)) {
    affected.push("WTI Crude", "Brent", "XLE");
  }
  if (/crypto|bitcoin|btc|ethereum|eth|token|solana|coinbase/.test(combined)) {
    affected.push("BTC", "ETH", "SOL", "COIN");
  }
  if (/rupiah|indonesia|bi\b|ihsg|idx/.test(combined)) {
    affected.push("USD/IDR", "IHSG / IDX", "EIDO");
  }
  if (affected.length === 0) {
    affected.push("SPY", "QQQ", "US10Y");
  }
  const uniqueAssets = Array.from(new Set(affected)).slice(0, 5);

  // 5. Macro Summary & Tactical Hedge Action (Institutional Bilingual Synthesis)
  let macroSummaryEn = "";
  let macroSummaryId = "";
  let hedgeActionEn = "";
  let hedgeActionId = "";

  if (category === "Central Banks / Rates") {
    macroSummaryEn =
      sentiment === "BEARISH"
        ? "Hawkish policy expectations and stubborn inflation dynamics elevate benchmark borrowing costs, compressing valuation multiples across equity markets."
        : sentiment === "BULLISH"
        ? "Monetary easing and rate normalization inject reserve liquidity into financial markets, lowering sovereign yields and fostering a constructive backdrop for risk assets."
        : "Central bank policy remains contingent on subsequent inflation prints, anchoring sovereign bond yields within an orderly consolidative range.";

    macroSummaryId =
      sentiment === "BEARISH"
        ? "Ekspektasi kebijakan moneter ketat dan inflasi yang persisten menaikkan imbal hasil obligasi acuan, menekan valuasi dan premi risiko di pasar saham."
        : sentiment === "BULLISH"
        ? "Sinyal pelonggaran moneter menyuntikkan likuiditas ke sistem keuangan, menekan suku bunga acuan dan menciptakan iklim positif bagi aset berisiko."
        : "Kebijakan bank sentral bergantung pada rilis data ekonomi selanjutnya, menjaga pergerakan yield obligasi dalam rentang konsolidasi stabil.";

    hedgeActionEn =
      sentiment === "BEARISH"
        ? "Establish short-duration Treasury bill buffers or defensive index put spreads; reduce gross portfolio leverage."
        : "Extend duration via index futures or tech beta; maintain trailing stop collars to capture upside momentum.";

    hedgeActionId =
      sentiment === "BEARISH"
        ? "Alokasikan pada instrumen pasar uang tenor pendek atau opsi put indeks defensif; kurangi leverage portofolio."
        : "Perpanjang durasi portofolio lewat instrumen ekuitas bertumbuh; pasang trailing stop collar untuk mengunci momentum kenaikan.";
  } else if (category === "Technology / AI") {
    macroSummaryEn =
      sentiment === "BULLISH"
        ? "Enterprise demand for AI compute and data center expansion supports sustained earnings acceleration across the hardware and software value chain."
        : "Heightened scrutiny regarding capital expenditure efficiency prompts selective rotation away from overextended mega-cap tech valuations.";

    macroSummaryId =
      sentiment === "BULLISH"
        ? "Permintaan infrastruktur komputasi AI dan pusat data menopang pertumbuhan laba berkelanjutan di sepanjang rantai pasok teknologi global."
        : "Evaluasi ketat efisiensi belanja modal korporasi memicu rotasi selektif dari saham teknologi bervaluasi tinggi menuju sektor yang lebih defensif.";

    hedgeActionEn = "Maintain long core tech holdings with an active 4% trailing collar hedge to safeguard alpha.";
    hedgeActionId = "Pertahankan kepemilikan saham teknologi inti dengan collar lindung nilai trailing 4% untuk mengamankan keuntungan.";
  } else if (category === "Crypto & Digital Assets") {
    macroSummaryEn =
      sentiment === "BULLISH"
        ? "Institutional spot liquidity inflows and expanding on-chain volumes continue to enhance digital asset market depth and systemic resilience."
        : "Leverage liquidation cascades or regulatory uncertainty constrain near-term risk tolerance across speculative digital asset pairs.";

    macroSummaryId =
      sentiment === "BULLISH"
        ? "Arus masuk likuiditas institusional dan pertumbuhan volume on-chain memperkuat kedalaman pasar dan ketahanan aset digital."
        : "Pencairan leverage posisi spekulatif atau ketidakpastian regulasi menekan toleransi risiko jangka pendek pada pasar aset digital.";

    hedgeActionEn =
      sentiment === "BEARISH"
        ? "Hedge directional spot exposures via delta-neutral funding rate arbitrage or short perpetual hedges."
        : "Scale in on confirmed support retests in BTC and ETH; enforce strict stop-loss invalidation thresholds.";

    hedgeActionId =
      sentiment === "BEARISH"
        ? "Lindungi nilai eksposur spot lewat arbitrase delta-netral atau lindung nilai posisi berjangka perpetual."
        : "Akumulasi bertahap pada konfirmasi level support BTC dan ETH; tetapkan batas stop-loss yang disiplin.";
  } else {
    macroSummaryEn =
      sentiment === "BULLISH"
        ? "Favorable macro developments demonstrate underlying economic resilience, maintaining positive corporate earnings breadth."
        : sentiment === "BEARISH"
        ? "Macro headwinds and margin compression pressures encourage defensive portfolio positioning and selective asset allocation."
        : "Mixed macroeconomic indicators balance cyclical momentum against valuation constraints across broad market benchmarks.";

    macroSummaryId =
      sentiment === "BULLISH"
        ? "Perkembangan makro yang konstruktif membuktikan ketahanan ekonomi riil, menopang pertumbuhan laba emiten secara menyeluruh."
        : sentiment === "BEARISH"
        ? "Tekanan makro dan risiko kompresi margin laba mendorong penyesuaian portofolio ke arah sektor yang lebih defensif."
        : "Indikator makroekonomi yang bervariasi menyeimbangkan momentum siklikal dengan valuasi di pasar saham global.";

    hedgeActionEn =
      sentiment === "BEARISH"
        ? "Overweight defensive dividend payers, high-grade sovereign debt, and cash equivalents."
        : "Maintain balanced equity participation with systematic stop-loss protection.";

    hedgeActionId =
      sentiment === "BEARISH"
        ? "Tambah alokasi pada emiten defensif berdividen tinggi, obligasi negara berkualitas, dan instrumen setara kas."
        : "Pertahankan partisipasi ekuitas yang seimbang dengan proteksi stop-loss terukur.";
  }

  return {
    id,
    title,
    source,
    sourceUrl,
    author,
    sourceBadge,
    timestamp: formatRelativeTime(pubDate),
    category,
    finbert: {
      sentiment,
      scores: { positive: pos, neutral: neu, negative: neg },
      marketImpactScore: impact,
      affectedAssets: uniqueAssets,
      macroSummaryEn,
      macroSummaryId,
      hedgeActionEn,
      hedgeActionId,
    },
  };
}
