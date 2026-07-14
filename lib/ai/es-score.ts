const SCORE_MAX = 100;

function clampScore(score: number): number | null {
  if (!Number.isFinite(score)) return null;
  const clamped = Math.max(0, Math.min(SCORE_MAX, score));
  return Math.round(clamped);
}

function normalizeScore(rawScore: number, denominator?: number): number | null {
  if (denominator === 10) return clampScore(rawScore * 10);
  if (denominator === 100) return clampScore(rawScore);
  if (rawScore <= 10) return clampScore(rawScore * 10);
  return clampScore(rawScore);
}

function parseLabeledScore(text: string): number | null {
  const totalScorePattern =
    /(?:総合スコア|総合評価|ESスコア|改善スコア|overall\s*score|score)[^\d]{0,24}(\d{1,3}(?:\.\d+)?)\s*(?:[\/／]\s*(100|10)|点|%)?/i;
  const match = text.match(totalScorePattern);
  if (!match) return null;

  const rawScore = Number(match[1]);
  const denominator = match[2] ? Number(match[2]) : undefined;
  return normalizeScore(rawScore, denominator);
}

function parseTenPointMetric(text: string, label: string): number | null {
  const pattern = new RegExp(`${label}[^\\d]{0,24}(\\d{1,2}(?:\\.\\d+)?)\\s*(?:[\\/／]\\s*10|点)?`);
  const match = text.match(pattern);
  if (!match) return null;
  return normalizeScore(Number(match[1]), 10);
}

export function extractEsScoreFromText(text: string): number | null {
  const labeledScore = parseLabeledScore(text);
  if (labeledScore !== null) return labeledScore;

  const metricScores = [
    parseTenPointMetric(text, "構成評価"),
    parseTenPointMetric(text, "明瞭性"),
    parseTenPointMetric(text, "具体性"),
    parseTenPointMetric(text, "説得力"),
  ].filter((score): score is number => score !== null);

  if (metricScores.length === 0) return null;
  return clampScore(metricScores.reduce((sum, score) => sum + score, 0) / metricScores.length);
}

export function extractEsScoreFromSavedSummary(savedSummary: string): number | null {
  try {
    const parsed = JSON.parse(savedSummary) as { summary?: unknown };
    if (typeof parsed?.summary === "string") {
      return extractEsScoreFromText(parsed.summary);
    }
  } catch {
    return extractEsScoreFromText(savedSummary);
  }

  return extractEsScoreFromText(savedSummary);
}
