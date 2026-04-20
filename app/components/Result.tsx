"use client";

import { useMemo } from "react";
import { SCENES, TRAIT_DESCRIPTIONS, TRAIT_KEYS } from "@/lib/scenes";
import {
  Answer,
  buildSummary,
  computeCategoryInsights,
  computeScores,
  computeThresholds,
} from "@/lib/scoring";
import { Ornament } from "./icons";

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
      "【わたしの定義】",
      summary.headline,
      "",
      ...ranked.map(
        (t, i) => `${String(i + 1).padStart(2, "0")}. ${t} — ${scores[t].normalized}`
      ),
      "",
      "#わたしの定義",
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      alert("鑑定書をコピーしました");
    } catch {
      alert("コピーに失敗しました");
    }
  };

  const answeredCount = answers.length;
  const yesCount = answers.filter((a) => a.choice === "yes").length;

  return (
    <div className="fade-in min-h-screen flex flex-col">
      <header className="px-6 md:px-16 pt-10 flex items-center justify-between hairline-b pb-6">
        <span className="caption">Certificate № 001</span>
        <span className="caption index-num">
          {answeredCount} / 100 responses
        </span>
      </header>

      <main className="max-w-3xl w-full mx-auto px-6 md:px-12 py-16 md:py-24">
        <section className="text-center mb-20 slow-fade">
          <p className="caption mb-6">— 鑑定書 —</p>
          <h1 className="font-display text-4xl md:text-6xl tracking-[0.1em] leading-[1.5] mb-8">
            わたしの定義
          </h1>
          <Ornament className="text-[color:var(--cream-mute)] mx-auto mb-10" />
          <p className="font-display text-xl md:text-2xl leading-[2] text-[color:var(--cream)]">
            {summary.headline}
          </p>
          <p className="text-sm md:text-base text-[color:var(--cream-mute)] mt-6 leading-loose">
            {summary.verdict}
          </p>
        </section>

        <section className="mb-20">
          <Header label="重要度の序列" sub="Traits, ranked by centrality" />
          <div className="hairline-t">
            {ranked.map((trait, i) => {
              const s = scores[trait];
              const width =
                ((s.importance - importanceRange.min) /
                  (importanceRange.max - importanceRange.min)) *
                100;
              return (
                <div
                  key={trait}
                  className="hairline-b py-5 grid grid-cols-[auto_1fr_auto] gap-4 md:gap-8 items-center"
                >
                  <span className="caption index-num w-8">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="font-display text-xl md:text-2xl mb-1">
                      {trait}
                    </div>
                    <div className="text-xs text-[color:var(--cream-mute)]">
                      {TRAIT_DESCRIPTIONS[trait]}
                    </div>
                    <div className="mt-3 bar-track h-px w-full">
                      <div
                        className="bar-fill h-px"
                        style={{ width: `${Math.max(2, width)}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-latin text-lg md:text-2xl tabular-nums text-[color:var(--cream)]">
                    {String(s.normalized).padStart(3, "0")}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-20">
          <Header
            label="崩壊点"
            sub="Thresholds at which self-identity collapses"
          />
          <div className="hairline-t grid md:grid-cols-2">
            {thresholds
              .filter((t) => t.count >= 2 && t.collapseAt != null)
              .sort((a, b) => (b.collapseAt ?? 0) - (a.collapseAt ?? 0))
              .map((t, i) => (
                <div
                  key={t.trait}
                  className={`hairline-b py-5 px-2 md:px-6 flex items-baseline justify-between ${
                    i % 2 === 0 ? "md:border-r md:hairline" : ""
                  }`}
                >
                  <span className="font-display text-lg">{t.trait}</span>
                  <span className="font-latin tabular-nums text-[color:var(--cream-dim)]">
                    {t.collapseAt}%
                  </span>
                </div>
              ))}
          </div>
          <p className="text-xs text-[color:var(--cream-mute)] mt-4 leading-relaxed">
            この値を下回ると、あなたは「もう自分ではない」と感じる傾向があります。
          </p>
        </section>

        {insights.length > 0 && (
          <section className="mb-20">
            <Header label="主題別の応答" sub="Response tendency by subject" />
            <div className="hairline-t">
              {insights.map((ins) => (
                <div
                  key={ins.category}
                  className="hairline-b py-4 flex items-center justify-between"
                >
                  <span className="font-display">{ins.category}</span>
                  <div className="flex items-center gap-6">
                    <span className="font-latin tabular-nums text-xs text-[color:var(--cream-mute)]">
                      {ins.yes} / {ins.total}
                    </span>
                    <span className="caption">
                      {ins.tendency === "受容"
                        ? "許容"
                        : ins.tendency === "拒絶"
                        ? "拒絶"
                        : "均衡"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="hairline-t pt-10 mb-10">
          <Header label="鑑定概要" sub="Summary" />
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-[color:var(--cream-mute)]">設問数</dt>
            <dd className="font-latin tabular-nums text-right">
              {answeredCount}
            </dd>
            <dt className="text-[color:var(--cream-mute)]">自分と認めた設問</dt>
            <dd className="font-latin tabular-nums text-right">{yesCount}</dd>
            <dt className="text-[color:var(--cream-mute)]">自己の中心</dt>
            <dd className="font-display text-right">
              {summary.primary ?? "—"}
            </dd>
            <dt className="text-[color:var(--cream-mute)]">変化に強い領域</dt>
            <dd className="font-display text-right">
              {summary.robust.slice(0, 2).join(" · ") || "—"}
            </dd>
          </dl>
        </section>

        <div className="flex flex-col sm:flex-row gap-3 hairline-t pt-10">
          <button
            onClick={copy}
            className="btn-ghost flex-1 py-4 font-display tracking-[0.15em]"
          >
            鑑定書を写す
          </button>
          <button
            onClick={onRestart}
            className="btn-primary flex-1 py-4 font-display tracking-[0.15em]"
          >
            もう一度、自分を問う
          </button>
        </div>
      </main>

      <footer className="hairline-t px-8 md:px-16 py-6 flex items-center justify-between">
        <span className="caption">わたしの定義</span>
        <span className="caption">watashi no teigi</span>
      </footer>
    </div>
  );
}

function Header({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between">
      <h2 className="font-display text-lg md:text-xl tracking-[0.15em]">
        {label}
      </h2>
      <span className="caption">{sub}</span>
    </div>
  );
}
