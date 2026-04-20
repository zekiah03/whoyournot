"use client";

import { useMemo } from "react";
import { SCENES, TRAIT_DESCRIPTIONS, TRAIT_KEYS, TraitKey } from "@/lib/scenes";
import {
  Answer,
  buildSummary,
  computeCategoryInsights,
  computeScores,
  computeThresholds,
} from "@/lib/scoring";

type Props = {
  answers: Answer[];
  onRestart: () => void;
};

export default function Result({ answers, onRestart }: Props) {
  const { scores, summary, thresholds, insights } = useMemo(() => {
    const scores = computeScores(answers, SCENES);
    const summary = buildSummary(scores);
    const thresholds = computeThresholds(answers, SCENES);
    const insights = computeCategoryInsights(answers, SCENES);
    return { scores, summary, thresholds, insights };
  }, [answers]);

  const ranked = useMemo(() => {
    return [...TRAIT_KEYS]
      .filter((t) => scores[t].count > 0)
      .sort((a, b) => scores[b].importance - scores[a].importance);
  }, [scores]);

  const importanceRange = useMemo(() => {
    const vals = ranked.map((t) => scores[t].importance);
    if (vals.length === 0) return { min: -1, max: 1 };
    const max = Math.max(...vals, 1);
    const min = Math.min(...vals, -1);
    const abs = Math.max(Math.abs(max), Math.abs(min), 1);
    return { min: -abs, max: abs };
  }, [ranked, scores]);

  const copy = async () => {
    const lines = [
      "【あなたの自分の定義】",
      summary.headline,
      "",
      ...ranked.map((t, i) => `${i + 1}. ${t} (${scores[t].normalized}/100)`),
      "",
      `#WhoYoureNot`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      alert("結果をコピーしました");
    } catch {
      alert("コピーに失敗しました");
    }
  };

  return (
    <div className="fade-in max-w-2xl mx-auto px-6 py-12">
      <p className="text-xs tracking-[0.3em] text-[color:var(--accent)] mb-3">
        YOUR SELF-DEFINITION
      </p>
      <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
        {summary.headline}
      </h1>
      <p className="text-zinc-400 mb-10 leading-relaxed">{summary.verdict}</p>

      <section className="mb-12">
        <h2 className="text-sm tracking-widest text-zinc-500 mb-4">
          重要度ランキング
        </h2>
        <div className="space-y-3">
          {ranked.map((trait, i) => {
            const s = scores[trait];
            const width =
              ((s.importance - importanceRange.min) /
                (importanceRange.max - importanceRange.min)) *
              100;
            const isPrimary = i === 0;
            return (
              <div key={trait} className="bg-card rounded-lg p-4">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-zinc-600 tabular-nums w-6">
                      #{i + 1}
                    </span>
                    <span
                      className={`font-bold ${
                        isPrimary ? "text-[color:var(--accent)]" : ""
                      }`}
                    >
                      {trait}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {TRAIT_DESCRIPTIONS[trait]}
                    </span>
                  </div>
                  <span className="text-xs tabular-nums text-zinc-400">
                    {s.normalized}/100
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="trait-bar h-full rounded-full"
                    style={{ width: `${Math.max(2, width)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-sm tracking-widest text-zinc-500 mb-4">
          崩壊点（あなたが“自分でなくなる”ライン）
        </h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {thresholds
            .filter((t) => t.count >= 2 && t.collapseAt != null)
            .sort((a, b) => (b.collapseAt ?? 0) - (a.collapseAt ?? 0))
            .slice(0, 6)
            .map((t) => (
              <div key={t.trait} className="bg-card rounded-lg p-3">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-sm">{t.trait}</span>
                  <span className="text-xs text-zinc-500">
                    {formatThreshold(t.collapseAt, t.minAccepted, t.maxRejected)}
                  </span>
                </div>
              </div>
            ))}
        </div>
        <p className="text-[11px] text-zinc-600 mt-3 leading-relaxed">
          その要素がこの%を下回ると、あなたは“もう自分じゃない”と感じる傾向があります。
        </p>
      </section>

      {insights.length > 0 && (
        <section className="mb-12">
          <h2 className="text-sm tracking-widest text-zinc-500 mb-4">
            カテゴリ別の傾向
          </h2>
          <div className="flex flex-wrap gap-2">
            {insights.map((ins) => (
              <span
                key={ins.category}
                className={`text-xs px-3 py-1.5 rounded-full border ${tendencyStyle(
                  ins.tendency
                )}`}
              >
                {ins.category}：{tendencyLabel(ins.tendency)}
                <span className="text-zinc-500 ml-1">
                  ({ins.yes}/{ins.total})
                </span>
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={copy}
          className="flex-1 bg-card rounded-xl py-3 font-semibold hover:border-[color:var(--accent)]/50 transition-colors"
        >
          結果をコピー
        </button>
        <button
          onClick={onRestart}
          className="btn-accent flex-1 text-white rounded-xl py-3 font-semibold active:scale-[0.98] transition-transform"
        >
          もう一度やる
        </button>
      </div>

      <p className="text-[10px] text-zinc-600 text-center mt-8">
        Who You&apos;re Not — 人間の定義を測る装置
      </p>
    </div>
  );
}

function tendencyLabel(t: string) {
  return t;
}

function tendencyStyle(t: string) {
  switch (t) {
    case "受容":
      return "border-emerald-500/30 bg-emerald-500/5 text-emerald-300";
    case "拒絶":
      return "border-red-500/30 bg-red-500/5 text-red-300";
    case "半々":
      return "border-amber-500/30 bg-amber-500/5 text-amber-300";
    default:
      return "border-white/10 text-zinc-400";
  }
}

function formatThreshold(
  collapseAt: number | null,
  minAccepted: number | null,
  maxRejected: number | null
) {
  if (collapseAt == null) return "—";
  if (minAccepted == null) return `${collapseAt}%より下`;
  if (maxRejected == null) return `${collapseAt}%より下`;
  return `${collapseAt}%以下で崩壊`;
}
