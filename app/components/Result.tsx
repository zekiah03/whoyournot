"use client";

import { useMemo, useRef, useState } from "react";
import { SCENES, TRAIT_DESCRIPTIONS, TRAIT_KEYS } from "@/lib/scenes";
import {
  Answer,
  buildSummary,
  computeCategoryInsights,
  computeScores,
  computeThresholds,
} from "@/lib/scoring";
import { IconArrow, Ornament } from "./icons";

type Props = {
  answers: Answer[];
  onRestart: () => void;
};

export default function Result({ answers, onRestart }: Props) {
  const { scores, summary, thresholds, insights } = useMemo(() => {
    const scores = computeScores(answers, SCENES);
    const thresholds = computeThresholds(answers, SCENES);
    const summary = buildSummary(scores, thresholds, answers);
    const insights = computeCategoryInsights(answers, SCENES);
    return { scores, summary, thresholds, insights };
  }, [answers]);

  const ranked = useMemo(() => {
    return [...TRAIT_KEYS]
      .filter((t) => scores[t].count > 0)
      .sort((a, b) => scores[b].normalized - scores[a].normalized);
  }, [scores]);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveRef = useRef<HTMLDivElement>(null);

  const copy = async () => {
    const lines = [
      "【わたしの定義】",
      summary.headline,
      summary.verdict,
      "",
      ...ranked.map(
        (t, i) =>
          `${String(i + 1).padStart(2, "0")}. ${t} — ${String(
            scores[t].normalized
          ).padStart(3, "0")}`
      ),
      "",
      "#わたしの定義",
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      notify("鑑定書をコピーしました");
    } catch {
      notify("コピーに失敗しました");
    }
  };

  const savePng = async () => {
    if (!saveRef.current || saving) return;
    setSaving(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(saveRef.current, {
        pixelRatio: 2,
        backgroundColor: "#141414",
        cacheBust: true,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "watashi-no-teigi.png";
      a.click();
    } catch {
      notify("画像の生成に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const answeredCount = answers.length;
  const yesCount = answers.filter((a) => a.choice === "yes").length;
  const sceneById = useMemo(() => new Map(SCENES.map((s) => [s.id, s])), []);

  return (
    <div className="fade-in min-h-screen flex flex-col">
      <header className="px-6 md:px-16 pt-10 flex items-center justify-between hairline-b pb-6">
        <span className="caption">Certificate № 001</span>
        <span className="caption index-num">
          {answeredCount} / 100 responses
        </span>
      </header>

      <main className="max-w-3xl w-full mx-auto px-6 md:px-12 py-16 md:py-24">
        <div ref={saveRef} className="bg-[color:var(--ink)] px-2 py-2">
          <section className="text-center mb-20 slow-fade">
            <p className="caption mb-6">— 鑑定書 —</p>
            <h1 className="font-display text-4xl md:text-6xl tracking-[0.1em] leading-[1.5] mb-8">
              わたしの定義
            </h1>
            <Ornament className="text-[color:var(--cream-mute)] mx-auto mb-10" />
            <p className="font-display text-xl md:text-3xl leading-[2] text-[color:var(--cream)]">
              {summary.headline}
            </p>
            <p className="font-display text-base md:text-xl leading-[2] text-[color:var(--cream-dim)] mt-2">
              {summary.verdict}
            </p>
            <p className="text-sm text-[color:var(--cream-mute)] mt-10 leading-loose">
              {summary.essence}
            </p>
          </section>

          <section className="mb-20">
            <Header label="重要度の序列" sub="Traits, ranked by centrality" />
            <div className="hairline-t">
              {ranked.map((trait, i) => {
                const s = scores[trait];
                const width = s.normalized;
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
            <p className="text-xs text-[color:var(--cream-mute)] mt-4 leading-relaxed">
              数値は 0〜100。50 が中立、100 に近いほどその要素を自己の核として重視している。
            </p>
          </section>

          <section className="mb-20">
            <Header
              label="崩壊点"
              sub="Thresholds at which self-identity collapses"
            />
            <div className="hairline-t grid md:grid-cols-2">
              {thresholds
                .filter(
                  (t) => t.confidence !== "low" && t.collapseAt != null
                )
                .sort((a, b) => (b.collapseAt ?? 0) - (a.collapseAt ?? 0))
                .map((t) => (
                  <div
                    key={t.trait}
                    className="hairline-b py-5 px-2 md:px-6 flex items-baseline justify-between"
                  >
                    <span className="font-display text-lg">{t.trait}</span>
                    <div className="flex items-baseline gap-3">
                      <span className="font-latin tabular-nums text-[color:var(--cream-dim)]">
                        {t.collapseAt}%
                      </span>
                      {t.confidence === "mid" && (
                        <span className="caption">参考</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
            <p className="text-xs text-[color:var(--cream-mute)] mt-4 leading-relaxed">
              この値を下回ると、あなたは「もう自分ではない」と感じる傾向があります。
              「参考」はサンプルが少なく、精度が低い値です。
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
                      <span className="caption w-12 text-right">
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
              <dt className="text-[color:var(--cream-mute)]">
                自分と認めた設問
              </dt>
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

          <p className="text-center caption pt-4 pb-2">
            わたしの定義 · watashi no teigi
          </p>
        </div>

        <section className="mt-12">
          <button
            onClick={() => setReviewOpen(!reviewOpen)}
            className="w-full flex items-center justify-between hairline-b py-4 group"
            aria-expanded={reviewOpen}
          >
            <span className="font-display text-lg tracking-[0.15em]">
              回答を振り返る
            </span>
            <span className="flex items-center gap-3 text-[color:var(--cream-mute)] group-hover:text-[color:var(--cream)] transition-colors">
              <span className="caption">{answeredCount} entries</span>
              <span
                className="transition-transform"
                style={{
                  transform: reviewOpen ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                <IconArrow size={14} />
              </span>
            </span>
          </button>
          {reviewOpen && (
            <div className="fade-in">
              {answers.map((a, i) => {
                const scene = sceneById.get(a.sceneId);
                if (!scene) return null;
                return (
                  <div
                    key={`${a.sceneId}-${i}`}
                    className="hairline-b py-4 grid grid-cols-[auto_1fr_auto] gap-3 md:gap-6 items-baseline"
                  >
                    <span className="caption index-num w-6">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm leading-relaxed text-[color:var(--cream)]">
                      {scene.text}
                    </span>
                    <span
                      className={`caption w-16 text-right ${
                        a.choice === "yes"
                          ? "text-[color:var(--cream)]"
                          : "text-[color:var(--cream-mute)]"
                      }`}
                    >
                      {a.choice === "yes" ? "自分だ" : "自分じゃない"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 hairline-t pt-10 mt-12">
          <button
            onClick={copy}
            className="btn-ghost py-4 font-display tracking-[0.15em]"
          >
            文字を写す
          </button>
          <button
            onClick={savePng}
            disabled={saving}
            className="btn-ghost py-4 font-display tracking-[0.15em] disabled:opacity-50"
          >
            {saving ? "生成中…" : "画像で保存"}
          </button>
          <button
            onClick={onRestart}
            className="btn-primary py-4 font-display tracking-[0.15em]"
          >
            もう一度、問う
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

function notify(message: string) {
  if (typeof window !== "undefined") {
    window.alert(message);
  }
}
