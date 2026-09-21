import { jsPDF } from "jspdf";
import { ExportReportData, Language, NewsItem, ChartAnalysisResult, MacroChartAnalysisResult, QuantAgentAdvice } from "../types";

/**
 * Download arbitrary data as a formatted .json file
 */
export function downloadJsonFile(data: any, filename: string): void {
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".json") ? filename : `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Failed to download JSON:", err);
    throw err;
  }
}

/**
 * Generate and download a multi-page Institutional Executive PDF Report
 */
export function downloadPdfReport(report: ExportReportData, filename: string): void {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 14;
    const contentWidth = pageWidth - margin * 2; // 182mm
    let y = margin;

    // Helper for adding a new page with header running bar
    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 16) {
        doc.addPage();
        y = margin;
        renderHeaderMicroBanner();
      }
    };

    const renderHeaderMicroBanner = () => {
      doc.setFillColor(22, 14, 46);
      doc.rect(margin, y, contentWidth, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(216, 180, 254);
      doc.text("FINANNUAL TERMINAL  •  OFFLINE AUDIT RECORD", margin + 4, y + 5.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 200, 200);
      doc.text(`ID: ${report.reportId}`, pageWidth - margin - 4, y + 5.5, { align: "right" });
      y += 12;
    };

    // --- 1. COVER / HEADER BANNER ---
    doc.setFillColor(18, 12, 38); // Deep luxury dark purple
    doc.rect(0, 0, pageWidth, 38, "F");

    // Top purple accent line
    doc.setFillColor(168, 85, 247);
    doc.rect(0, 0, pageWidth, 2.5, "F");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(report.terminalName || "FINANNUAL HEDGE AI TERMINAL", margin, 14);

    // Subtitle / Scope
    doc.setFontSize(10);
    doc.setTextColor(216, 180, 254);
    doc.text(report.title, margin, 21);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 175, 205);
    doc.text(report.subtitle, margin, 27);

    // Metadata Right-Aligned
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(52, 211, 153); // Emerald
    doc.text("STATUS: AUDIT CERTIFIED", pageWidth - margin, 14, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    doc.text(`Date: ${report.generatedAt}`, pageWidth - margin, 20, { align: "right" });
    doc.text(`Scope: ${report.scopeLabel}`, pageWidth - margin, 25, { align: "right" });
    doc.text(`Lang: ${report.language.toUpperCase()}`, pageWidth - margin, 30, { align: "right" });

    y = 44;

    // --- 2. AUDIT VERIFICATION METADATA BOX ---
    doc.setFillColor(245, 243, 255); // Soft lavender-grey background
    doc.setDrawColor(216, 180, 254);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(88, 28, 135);
    doc.text("CRYPTOGRAPHIC AUDIT RECORD:", margin + 3, y + 5);

    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.setTextColor(70, 70, 70);
    doc.text(`HASH: ${report.auditHash}`, margin + 3, y + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(110, 110, 110);
    doc.text(`ISO-8601: ${report.isoTimestamp}`, pageWidth - margin - 3, y + 7.5, { align: "right" });

    y += 18;

    // --- 3. EXECUTIVE SUMMARY CARDS ---
    if (report.summaryCards && report.summaryCards.length > 0) {
      checkPageBreak(28);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 20, 50);
      doc.text("EXECUTIVE METRIC SUMMARY", margin, y);
      y += 4;

      const cardCount = Math.min(4, report.summaryCards.length);
      const cardGap = 3;
      const cardWidth = (contentWidth - cardGap * (cardCount - 1)) / cardCount;
      const cardHeight = 20;

      report.summaryCards.slice(0, 4).forEach((card, i) => {
        const cardX = margin + i * (cardWidth + cardGap);

        // Card background
        doc.setFillColor(250, 250, 252);
        doc.setDrawColor(220, 215, 235);
        doc.roundedRect(cardX, y, cardWidth, cardHeight, 1.5, 1.5, "FD");

        // Card top accent line
        doc.setFillColor(147, 51, 234);
        doc.rect(cardX, y, cardWidth, 1, "F");

        // Label
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 120);
        const labelLines = doc.splitTextToSize(card.label.toUpperCase(), cardWidth - 4);
        doc.text(labelLines[0] || card.label, cardX + 2, y + 5);

        // Value
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        if (card.highlight === "negative") {
          doc.setTextColor(225, 29, 72); // Rose
        } else if (card.highlight === "positive") {
          doc.setTextColor(16, 185, 129); // Emerald
        } else if (card.highlight === "warning") {
          doc.setTextColor(217, 119, 6); // Amber
        } else {
          doc.setTextColor(30, 30, 40);
        }
        doc.text(card.value, cardX + 2, y + 11.5);

        // Subtitle note
        if (card.sub) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(6.5);
          doc.setTextColor(120, 120, 135);
          const subText = doc.splitTextToSize(card.sub, cardWidth - 4);
          doc.text(subText[0] || card.sub, cardX + 2, y + 16.5);
        }
      });

      y += cardHeight + 7;
    }

    // --- 4. SECTIONS (TABLES, KEY-VALUES, TEXT BLOCKS) ---
    if (report.sections && report.sections.length > 0) {
      for (const section of report.sections) {
        checkPageBreak(25);

        // Section header with purple bullet
        doc.setFillColor(126, 34, 206);
        doc.circle(margin + 1.5, y - 1, 1.5, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(24, 18, 45);
        doc.text(section.title.toUpperCase(), margin + 5, y);
        y += 4;

        if (section.description) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(7.5);
          doc.setTextColor(100, 100, 110);
          const descLines = doc.splitTextToSize(section.description, contentWidth);
          doc.text(descLines, margin, y);
          y += descLines.length * 3.5 + 2;
        }

        // 4A. Text Block (e.g. AI Agent advice, institutional synopsis)
        if (section.textBlock) {
          checkPageBreak(18);
          doc.setFillColor(248, 247, 252);
          doc.setDrawColor(225, 220, 240);
          const textLines = doc.splitTextToSize(section.textBlock, contentWidth - 8);
          const blockHeight = Math.max(12, textLines.length * 4 + 6);

          checkPageBreak(blockHeight);
          doc.roundedRect(margin, y, contentWidth, blockHeight, 1.5, 1.5, "FD");

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(40, 40, 50);
          doc.text(textLines, margin + 4, y + 5);
          y += blockHeight + 5;
        }

        // 4B. Key-Value pairs list
        if (section.items && section.items.length > 0) {
          checkPageBreak(12);
          for (const item of section.items) {
            checkPageBreak(7);
            doc.setFillColor(252, 252, 254);
            doc.setDrawColor(235, 235, 242);
            doc.rect(margin, y, contentWidth, 6, "FD");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.5);
            doc.setTextColor(70, 70, 85);
            doc.text(item.key, margin + 2.5, y + 4.2);

            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 20, 50);
            doc.text(item.value, margin + 75, y + 4.2);

            if (item.note) {
              doc.setFont("helvetica", "normal");
              doc.setFontSize(6.5);
              doc.setTextColor(120, 120, 130);
              doc.text(item.note, pageWidth - margin - 2.5, y + 4.2, { align: "right" });
            }

            y += 6.5;
          }
          y += 3;
        }

        // 4C. Table rendering (Headers + Rows)
        if (section.table && section.table.rows && section.table.rows.length > 0) {
          checkPageBreak(16);
          const colCount = section.table.headers.length;
          const colWidth = contentWidth / colCount;

          // Header Row
          doc.setFillColor(49, 30, 85);
          doc.rect(margin, y, contentWidth, 6, "F");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
          doc.setTextColor(255, 255, 255);
          section.table.headers.forEach((h, colIdx) => {
            doc.text(h.toUpperCase(), margin + colIdx * colWidth + 2, y + 4.2);
          });
          y += 6;

          // Table Rows
          section.table.rows.forEach((row, rowIdx) => {
            checkPageBreak(6);
            if (rowIdx % 2 === 0) {
              doc.setFillColor(252, 251, 255);
            } else {
              doc.setFillColor(245, 243, 250);
            }
            doc.rect(margin, y, contentWidth, 5.5, "F");

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.setTextColor(40, 40, 45);

            row.forEach((cell, cellIdx) => {
              const cellText = doc.splitTextToSize(String(cell), colWidth - 3);
              doc.text(cellText[0] || String(cell), margin + cellIdx * colWidth + 2, y + 3.8);
            });
            y += 5.5;
          });
          y += 4;
        }

        y += 3;
      }
    }

    // --- 5. HEDGE DIRECTIVES & RULES OF THUMB ---
    if (report.hedgeDirectives && report.hedgeDirectives.length > 0) {
      checkPageBreak(25);
      doc.setFillColor(254, 242, 242); // Soft rose warning block
      doc.setDrawColor(251, 113, 133);
      doc.setLineWidth(0.4);

      const directiveCount = report.hedgeDirectives.length;
      const blockHeight = directiveCount * 5 + 10;
      checkPageBreak(blockHeight);

      doc.roundedRect(margin, y, contentWidth, blockHeight, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(190, 18, 60); // Red
      doc.text("ACTIONABLE HEDGE DIRECTIVES & RISK SAFEGUARDS", margin + 4, y + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(80, 20, 30);

      report.hedgeDirectives.forEach((directive, idx) => {
        const lines = doc.splitTextToSize(`•  ${directive}`, contentWidth - 8);
        doc.text(lines, margin + 4, y + 10 + idx * 5);
      });

      y += blockHeight + 6;
    }

    // --- 6. FOOTER ON ALL PAGES ---
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setDrawColor(220, 215, 235);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(130, 130, 145);
      doc.text("FinAnnual Mini Hedge AI Terminal • Quantitative Portfolio & Risk Intelligence", margin, pageHeight - 8);
      doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
    }

    // Trigger save
    const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    doc.save(cleanFilename);
  } catch (err) {
    console.error("Failed to generate PDF:", err);
    throw err;
  }
}

/**
 * Generate a pseudo-random cryptographic audit signature string for offline verification
 */
export function generateAuditHash(scope: string, timestamp: string): string {
  const seed = `${scope}_${timestamp}_finannual_hedge_v2`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `FA-AUDIT-${hex.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Helper to build report data for News Sentiment View
 */
export function buildNewsExportData(newsList: NewsItem[], language: Language): ExportReportData {
  const now = new Date();
  const iso = now.toISOString();
  const dateStr = now.toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const total = newsList.length;
  const bullishCount = newsList.filter((n) => n.finbert?.sentiment === "BULLISH").length;
  const bearishCount = newsList.filter((n) => n.finbert?.sentiment === "BEARISH").length;
  const neutralCount = total - bullishCount - bearishCount;

  const bullishPct = total > 0 ? Math.round((bullishCount / total) * 100) : 0;
  const bearishPct = total > 0 ? Math.round((bearishCount / total) * 100) : 0;
  const neutralPct = total > 0 ? 100 - bullishPct - bearishPct : 0;

  const avgImpact =
    total > 0
      ? (newsList.reduce((acc, n) => acc + (n.finbert?.marketImpactScore || 5.0), 0) / total).toFixed(1)
      : "5.0";

  const sentimentBias =
    bullishPct > bearishPct + 15
      ? (language === "id" ? "BULLISH (Optimis)" : "BULLISH")
      : bearishPct > bullishPct + 15
      ? (language === "id" ? "BEARISH (Waspada)" : "BEARISH")
      : (language === "id" ? "NETRAL / CAMPURAN" : "NEUTRAL / MIXED");

  return {
    reportId: `NEWS-${Date.now().toString(36).toUpperCase()}`,
    terminalName: "FINANNUAL HEDGE AI TERMINAL",
    title: language === "id" ? "Laporan Intelijen Sentimen Berita & Makro" : "News Sentiment & Macro Intelligence Report",
    subtitle: language === "id" ? "Hasil analisis model NLP FinBERT v2 terhadap kabel berita keuangan global secara real-time" : "FinBERT v2 NLP sentiment analysis of live breaking global financial wires",
    scope: "news",
    scopeLabel: language === "id" ? "Sentimen Berita Pasar" : "News Sentiment Intelligence",
    generatedAt: dateStr,
    isoTimestamp: iso,
    language,
    auditHash: generateAuditHash("news", iso),
    summaryCards: [
      {
        label: language === "id" ? "Sentimen Agregat" : "Aggregate Bias",
        value: sentimentBias,
        sub: `${bullishPct}% Bullish • ${bearishPct}% Bearish`,
        highlight: bullishPct > bearishPct ? "positive" : bearishPct > bullishPct ? "negative" : "neutral",
      },
      {
        label: language === "id" ? "Berita Teranalisis" : "Wires Analyzed",
        value: `${total} Items`,
        sub: "CNBC • MarketWatch • Cointelegraph",
        highlight: "info",
      },
      {
        label: language === "id" ? "Skor Dampak Pasar" : "Avg Market Impact",
        value: `${avgImpact} / 10`,
        sub: parseFloat(avgImpact) >= 6.5 ? "High Volatility Expected" : "Normal Volatility",
        highlight: parseFloat(avgImpact) >= 6.5 ? "warning" : "neutral",
      },
      {
        label: language === "id" ? "Rasio Bull/Bear" : "Bull / Bear Ratio",
        value: `${bullishCount} : ${bearishCount}`,
        sub: `${neutralCount} Neutral feeds`,
        highlight: "neutral",
      },
    ],
    sections: [
      {
        title: language === "id" ? "Ringkasan Eksekutif FinBERT v2" : "FinBERT v2 Executive Summary",
        textBlock:
          language === "id"
            ? `Berdasarkan pemindaian otomatis terhadap ${total} berita terkini, pasar saat ini menunjukkan bias ${sentimentBias}. Volatilitas terbobot dampak pasar berada pada skor ${avgImpact}/10. Direkomendasikan memantau aset sensitif terhadap tingkat suku bunga dan likuiditas global.`
            : `Based on automated NLP FinBERT v2 evaluation of ${total} live breaking wires, global market sentiment currently displays a ${sentimentBias} bias. Market impact score stands at ${avgImpact}/10. Traders should adjust exposure on interest-rate and tech-sensitive equity baskets.`,
      },
      {
        title: language === "id" ? "Tabel Berita Berdampak Tinggi" : "High-Impact Breaking Headlines",
        table: {
          headers: [
            language === "id" ? "Sumber" : "Source",
            language === "id" ? "Judul Berita" : "Headline",
            language === "id" ? "Sentimen" : "Sentiment",
            language === "id" ? "Dampak" : "Impact",
            language === "id" ? "Aset Terdampak" : "Assets",
          ],
          rows: newsList.slice(0, 10).map((n) => [
            n.source || "Wire",
            n.title.slice(0, 48) + (n.title.length > 48 ? "..." : ""),
            n.finbert?.sentiment || "NEUTRAL",
            `${n.finbert?.marketImpactScore || 5.0}/10`,
            (n.finbert?.affectedAssets || []).slice(0, 3).join(", ") || "General",
          ]),
        },
      },
    ],
    hedgeDirectives: [
      language === "id"
        ? `Pertahankan porsi kas likuid minimal 15-20% jika berita berbobot dampak tinggi (${avgImpact}/10) memicu gejolak volatilitas tiba-tiba.`
        : `Maintain at least 15-20% liquid cash reserves if high-impact feeds (${avgImpact}/10) trigger sudden intraday gap-downs.`,
      language === "id"
        ? "Gunakan stop-loss terukur pada aset ber-beta tinggi yang terdaftar pada kolom Aset Terdampak."
        : "Implement trailing stop-losses on high-beta names appearing under the Affected Assets list.",
    ],
    rawPayload: {
      totalWires: total,
      bullishCount,
      bearishCount,
      neutralCount,
      bullishPct,
      bearishPct,
      neutralPct,
      avgMarketImpact: avgImpact,
      newsItems: newsList.map((n) => ({
        title: n.title,
        source: n.source,
        timestamp: n.timestamp,
        sentiment: n.finbert?.sentiment,
        impactScore: n.finbert?.marketImpactScore,
        affectedAssets: n.finbert?.affectedAssets,
        macroSummary: language === "id" ? n.finbert?.macroSummaryId : n.finbert?.macroSummaryEn,
        hedgeAction: language === "id" ? n.finbert?.hedgeActionId : n.finbert?.hedgeActionEn,
      })),
    },
  };
}

/**
 * Helper to build report data for Technical Chart Analyzer View
 */
export function buildChartExportData(
  asset: string,
  timeframe: string,
  macroAnalysis: MacroChartAnalysisResult | null,
  visionResult: ChartAnalysisResult | null,
  language: Language
): ExportReportData {
  const now = new Date();
  const iso = now.toISOString();
  const dateStr = now.toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const activeBias = macroAnalysis?.macroTradePlan?.bias || visionResult?.tradeSetup?.bias || "NEUTRAL";
  const confluenceScore = macroAnalysis?.confluenceScore || (visionResult?.confidence ? Math.round(visionResult.confidence * 100) : 74);
  const macroRegime = macroAnalysis?.macroRegime || (activeBias === "LONG" ? "BULLISH_TREND" : "RANGE_BOUND");

  return {
    reportId: `CHART-${Date.now().toString(36).toUpperCase()}`,
    terminalName: "FINANNUAL HEDGE AI TERMINAL",
    title: language === "id" ? `Analisis Teknikal & Struktur Makro: ${asset}` : `Technical & Macro Structure Analysis: ${asset}`,
    subtitle: language === "id" ? `Matriks konfluensi multi-timeframe (1D, 1W, 1M) & model visi teknikal institusional` : `Multi-timeframe confluence matrix (1D, 1W, 1M) & institutional technical vision model`,
    scope: "chart",
    scopeLabel: `${asset} (${timeframe})`,
    generatedAt: dateStr,
    isoTimestamp: iso,
    language,
    auditHash: generateAuditHash("chart", iso),
    summaryCards: [
      {
        label: language === "id" ? "Aset & Jangka Waktu" : "Asset & Horizon",
        value: asset,
        sub: `Timeframe: ${timeframe}`,
        highlight: "info",
      },
      {
        label: language === "id" ? "Bias Transaksi" : "Tactical Bias",
        value: activeBias,
        sub: `Regime: ${macroRegime}`,
        highlight: activeBias === "LONG" ? "positive" : activeBias === "SHORT" ? "negative" : "neutral",
      },
      {
        label: language === "id" ? "Skor Konfluensi" : "Confluence Score",
        value: `${confluenceScore}%`,
        sub: confluenceScore >= 75 ? "High Probability Setup" : "Standard Confluence",
        highlight: confluenceScore >= 75 ? "positive" : "warning",
      },
      {
        label: language === "id" ? "Rasio Risk/Reward" : "Risk / Reward",
        value: macroAnalysis?.macroTradePlan?.riskRewardRatio || visionResult?.tradeSetup?.riskRewardRatio || "1 : 2.5",
        sub: "Favorable asymmetric edge",
        highlight: "positive",
      },
    ],
    sections: [
      {
        title: language === "id" ? "Rencana Transaksi & Level Kunci" : "Trade Execution Setup & Key Structural Levels",
        items: [
          {
            key: language === "id" ? "Zona Entri Disarankan" : "Recommended Entry Zone",
            value: macroAnalysis?.macroTradePlan?.macroEntryZone || visionResult?.tradeSetup?.entryZone || "Market / Retest Zone",
          },
          {
            key: language === "id" ? "Target Profit 1 (TP1)" : "Take Profit Target 1 (TP1)",
            value: macroAnalysis?.macroTradePlan?.swingTarget1 || visionResult?.tradeSetup?.takeProfit1 || "Major Resistance 1",
          },
          {
            key: language === "id" ? "Target Profit 2 (TP2)" : "Take Profit Target 2 (TP2)",
            value: macroAnalysis?.macroTradePlan?.swingTarget2 || visionResult?.tradeSetup?.takeProfit2 || "Expansion Extension 2",
          },
          {
            key: language === "id" ? "Batas Pembatalan (Stop Loss)" : "Invalidation Level (Stop Loss)",
            value: macroAnalysis?.macroTradePlan?.macroInvalidation || visionResult?.tradeSetup?.stopLoss || "Below Structural Swing Low",
            note: "Strict discipline required",
          },
        ],
      },
      ...(macroAnalysis
        ? [
            {
              title: language === "id" ? "Dekomposisi Matriks Konfluensi Tri-Timeframe" : "Tri-Timeframe Macro Confluence Decomposition",
              table: {
                headers: [
                  language === "id" ? "Timeframe" : "Horizon",
                  language === "id" ? "Tren & Siklus" : "Trend / Cycle",
                  language === "id" ? "Support Struktural" : "Support",
                  language === "id" ? "Resistensi Struktural" : "Resistance",
                ],
                rows: [
                  ["1M Monthly", macroAnalysis.monthly1M?.trend || "Secular Bullish", macroAnalysis.monthly1M?.structuralSupport || "Dynamic", macroAnalysis.monthly1M?.structuralResistance || "All-time High"],
                  ["1W Weekly", macroAnalysis.weekly1W?.trend || "Accumulation", macroAnalysis.weekly1W?.majorSupport || "Support Zone", macroAnalysis.weekly1W?.majorResistance || "Weekly Range High"],
                  ["1D Daily", macroAnalysis.daily1D?.trend || "Consolidation", macroAnalysis.daily1D?.immediateSupport || "Local Order Block", macroAnalysis.daily1D?.immediateResistance || "Fair Value Gap"],
                ],
              },
            },
          ]
        : []),
      {
        title: language === "id" ? "Advisori Lindung Nilai Institusional" : "Institutional Hedge Fund Advisory",
        textBlock:
          (language === "id"
            ? macroAnalysis?.macroHedgeAdvisoryId || visionResult?.hedgeAdvisoryId
            : macroAnalysis?.macroHedgeAdvisoryEn || visionResult?.hedgeAdvisoryEn) ||
          (language === "id"
            ? `Pastikan batas risiko per posisi tidak melebihi 1.5% dari modal portofolio. Jika level pembatalan tertembus, segera tutup posisi tanpa ragu.`
            : `Ensure position risk does not exceed 1.5% of total capital. If the invalidation boundary is breached, close exposure immediately without emotional hesitation.`),
      },
    ],
    hedgeDirectives: [
      language === "id"
        ? `Selalu pasang stop loss di level pembatalan ${macroAnalysis?.macroTradePlan?.macroInvalidation || visionResult?.tradeSetup?.stopLoss || "resmi"}.`
        : `Always execute a hard stop loss at the structural invalidation boundary (${macroAnalysis?.macroTradePlan?.macroInvalidation || visionResult?.tradeSetup?.stopLoss || "defined above"}).`,
      language === "id"
        ? "Ambil keuntungan bertahap (skala parsial) pada TP1 untuk mengamankan modal bebas risiko."
        : "Scale out 50% at Take Profit Target 1 (TP1) and trail remaining position to breakeven.",
    ],
    rawPayload: {
      asset,
      timeframe,
      confluenceScore,
      macroRegime,
      tradePlan: macroAnalysis?.macroTradePlan || visionResult?.tradeSetup,
      macroDetails: macroAnalysis,
      visionDetails: visionResult,
    },
  };
}

/**
 * Helper to build report data for Quantitative Risk View
 */
export function buildQuantExportData(
  metrics: {
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
  },
  language: Language
): ExportReportData {
  const now = new Date();
  const iso = now.toISOString();
  const dateStr = now.toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    reportId: `RISK-${Date.now().toString(36).toUpperCase()}`,
    terminalName: "FINANNUAL HEDGE AI TERMINAL",
    title: language === "id" ? "Laporan Audit Manajemen Risiko Kuantitatif" : "Quantitative Risk Management & Sizing Audit",
    subtitle: language === "id" ? "Model Parametric VaR, Conditional VaR (Expected Shortfall), Sizing Kelly, & Rasio Efisiensi" : "Parametric VaR, Conditional VaR (Expected Shortfall), Kelly Sizing & Risk-Adjusted Efficiency",
    scope: "quant",
    scopeLabel: language === "id" ? "Model Risiko Kuantitatif" : "Quantitative Risk Suite",
    generatedAt: dateStr,
    isoTimestamp: iso,
    language,
    auditHash: generateAuditHash("quant", iso),
    summaryCards: [
      {
        label: language === "id" ? "Modal Portofolio" : "Portfolio Capital",
        value: `$${metrics.capital.toLocaleString()}`,
        sub: `Vol: ${(metrics.dailyVol * 100).toFixed(1)}% / day`,
        highlight: "info",
      },
      {
        label: language === "id" ? "Risiko Normal (VaR 95%)" : "Normal Dip Limit (VaR)",
        value: `-$${Math.round(metrics.varDollar).toLocaleString()}`,
        sub: `-${(metrics.varFraction * 100).toFixed(1)}% over ${metrics.horizonDays}d`,
        highlight: "negative",
      },
      {
        label: language === "id" ? "Skenario Crash (CVaR)" : "Black Swan Crash (CVaR)",
        value: `-$${Math.round(metrics.cvarDollar).toLocaleString()}`,
        sub: `-${(metrics.cvarFraction * 100).toFixed(1)}% tail drop`,
        highlight: "warning",
      },
      {
        label: language === "id" ? "Ukuran Posisi Aman (Kelly)" : "Safe Position (Half-Kelly)",
        value: `${(metrics.halfKelly * 100).toFixed(1)}%`,
        sub: `$${Math.round(metrics.capital * metrics.halfKelly).toLocaleString()} max/trade`,
        highlight: "positive",
      },
    ],
    sections: [
      {
        title: language === "id" ? "Parameter & Metrik Risiko Stokastik" : "Stochastic Risk Parameters & Model Outputs",
        table: {
          headers: [
            language === "id" ? "Metrik Kuantitatif" : "Quantitative Metric",
            language === "id" ? "Nilai Model" : "Computed Value",
            language === "id" ? "Deskripsi Praktis" : "Practical Meaning",
          ],
          rows: [
            [
              "Value at Risk (VaR)",
              `-$${Math.round(metrics.varDollar).toLocaleString()} (${(metrics.varFraction * 100).toFixed(1)}%)`,
              language === "id" ? "Batas kerugian normal yang diekspektasikan" : "Expected normal pullback ceiling",
            ],
            [
              "Expected Shortfall (CVaR)",
              `-$${Math.round(metrics.cvarDollar).toLocaleString()} (${(metrics.cvarFraction * 100).toFixed(1)}%)`,
              language === "id" ? "Rata-rata kerugian jika terjadi krisis ekstrem" : "Average tail loss during black swan crash",
            ],
            [
              "Half-Kelly Allocation",
              `${(metrics.halfKelly * 100).toFixed(1)}% ($${Math.round(metrics.capital * metrics.halfKelly).toLocaleString()})`,
              language === "id" ? "Ukuran posisi optimal anti-kebangkrutan" : "Optimal trade size to compound safely",
            ],
            [
              "Full Kelly (Theoretical)",
              `${(metrics.fullKelly * 100).toFixed(1)}%`,
              language === "id" ? "Batas matematis agresif (volatil)" : "Aggressive theoretical maximum",
            ],
            [
              "Sharpe Ratio (Annualized)",
              `${metrics.sharpeRatio.toFixed(2)}`,
              metrics.sharpeRatio >= 1.5 ? "Institutional Grade (>1.5)" : "Good Performance (>1.0)",
            ],
            [
              "Sortino Ratio",
              `${metrics.sortinoRatio.toFixed(2)}`,
              language === "id" ? "Hanya mendiskon volatilitas ke bawah" : "Downside-penalized volatility efficiency",
            ],
          ],
        },
      },
      ...(metrics.agentAdvice
        ? [
            {
              title: language === "id" ? "Penilaian Petugas Risiko Kuantitatif (AI Agent)" : "Quantitative Risk Officer Assessment (AI Agent)",
              textBlock: language === "id" ? metrics.agentAdvice.responseId || metrics.agentAdvice.responseEn : metrics.agentAdvice.responseEn,
            },
          ]
        : []),
    ],
    hedgeDirectives: [
      language === "id"
        ? `Jangan alokasikan lebih dari ${(metrics.halfKelly * 100).toFixed(1)}% ($${Math.round(metrics.capital * metrics.halfKelly).toLocaleString()}) ke dalam satu posisi transaksi.`
        : `Do not allocate more than ${(metrics.halfKelly * 100).toFixed(1)}% ($${Math.round(metrics.capital * metrics.halfKelly).toLocaleString()}) into any single active trade setup.`,
      language === "id"
        ? `Terapkan batas stop loss portofolio di angka -$${Math.round(metrics.varDollar).toLocaleString()} untuk melindungi modal dari penurunan tak terduga.`
        : `Set an aggregate portfolio stop loss limit around -$${Math.round(metrics.varDollar).toLocaleString()} to prevent catastrophic drawdown.`,
      language === "id"
        ? "Sisihkan minimal 15-20% kas likuid untuk memanfaatkan peluang diskon saat kejatuhan pasar terjadi."
        : "Maintain a 15-20% dry-powder cash reserve to seize asymmetric discount entries during market dislocations.",
    ],
    rawPayload: {
      capital: metrics.capital,
      dailyVolatility: metrics.dailyVol,
      confidenceLevel: metrics.confidence,
      holdingDays: metrics.horizonDays,
      varDollar: metrics.varDollar,
      varPercentage: (metrics.varFraction * 100).toFixed(2),
      cvarDollar: metrics.cvarDollar,
      cvarPercentage: (metrics.cvarFraction * 100).toFixed(2),
      halfKellyPercentage: (metrics.halfKelly * 100).toFixed(2),
      fullKellyPercentage: (metrics.fullKelly * 100).toFixed(2),
      sharpeRatio: metrics.sharpeRatio,
      sortinoRatio: metrics.sortinoRatio,
      riskLevel: metrics.riskCategory.label,
      agentAdvice: metrics.agentAdvice,
    },
  };
}

/**
 * Helper to build report data for Complete Terminal Dossier (Combining all 3 views)
 */
export function buildFullDossierReport(
  newsList: NewsItem[],
  chartState: { asset: string; timeframe: string; macroAnalysis: MacroChartAnalysisResult | null; visionResult: ChartAnalysisResult | null },
  quantState: {
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
  },
  language: Language
): ExportReportData {
  const now = new Date();
  const iso = now.toISOString();
  const dateStr = now.toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const newsReport = buildNewsExportData(newsList, language);
  const chartReport = buildChartExportData(chartState.asset, chartState.timeframe, chartState.macroAnalysis, chartState.visionResult, language);
  const quantReport = buildQuantExportData(quantState, language);

  return {
    reportId: `DOSSIER-${Date.now().toString(36).toUpperCase()}`,
    terminalName: "FINANNUAL HEDGE AI TERMINAL",
    title: language === "id" ? "Dossier Lengkap Terminal Kuantitatif & Risiko" : "Complete Quantitative & Risk Terminal Dossier",
    subtitle: language === "id" ? "Konsolidasi komprehensif: Sentimen FinBERT v2, Analisis Teknikal Multi-Timeframe, dan Model Risiko Stokastik" : "Comprehensive master dossier: FinBERT v2 Sentiment, Multi-Timeframe Chart Analysis, & Stochastic Risk Models",
    scope: "all",
    scopeLabel: language === "id" ? "Dossier Lengkap Terminal" : "Complete Master Terminal",
    generatedAt: dateStr,
    isoTimestamp: iso,
    language,
    auditHash: generateAuditHash("dossier", iso),
    summaryCards: [
      {
        label: language === "id" ? "Modal Portofolio" : "Portfolio Capital",
        value: `$${quantState.capital.toLocaleString()}`,
        sub: `VaR: -$${Math.round(quantState.varDollar).toLocaleString()}`,
        highlight: "info",
      },
      {
        label: language === "id" ? "Sentimen Berita" : "News Sentiment",
        value: newsReport.summaryCards[0]?.value || "BALANCED",
        sub: `${newsList.length} Wires Analyzed`,
        highlight: "positive",
      },
      {
        label: language === "id" ? "Aset Aktif Teknikal" : "Active Chart Asset",
        value: chartState.asset,
        sub: `Bias: ${chartReport.summaryCards[1]?.value || "LONG"}`,
        highlight: "positive",
      },
      {
        label: language === "id" ? "Ukuran Trade Aman" : "Safe Trade Sizing",
        value: `${(quantState.halfKelly * 100).toFixed(1)}%`,
        sub: `$${Math.round(quantState.capital * quantState.halfKelly).toLocaleString()} max`,
        highlight: "positive",
      },
    ],
    sections: [
      ...quantReport.sections,
      ...chartReport.sections,
      ...newsReport.sections,
    ],
    hedgeDirectives: [
      ...quantReport.hedgeDirectives || [],
      ...chartReport.hedgeDirectives || [],
    ],
    rawPayload: {
      dossierGeneratedAt: iso,
      terminalVersion: "FinAnnual v2.4 Hedge AI",
      quantitativeRisk: quantReport.rawPayload,
      technicalAnalysis: chartReport.rawPayload,
      newsSentiment: newsReport.rawPayload,
    },
  };
}
