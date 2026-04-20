"use client";

import { useMemo, useRef, useState } from "react";
import { SCENES, TRAIT_DESCRIPTIONS, TRAIT_KEYS, TraitKey } from "@/lib/scenes";
import {
  Answer,
  Scores,
  Summary,
  buildSummary,
  computeCategoryInsights,
  computeScores,
  computeThresholds,
} from "@/lib/scoring";
import {
  COLLAPSE_LEVEL_LABELS,
  LEVEL_LABELS,
  scoreToLevel,
  voiceFor,
} from "@/lib/levels";
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

  const topFive = useMemo(() => ranked.slice(0, 5), [ranked]);
  const primaryCollapse = useMemo(() => {
    if (!summary.primary) return null;
    return (
      thresholds.find((t) => t.trait === summary.primary)?.collapseAt ?? null
    );
  }, [thresholds, summary.primary]);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveRef = useRef<HTMLDivElement>(null);

  const copy = async () => {
    const lines = [
      "【わたしの定義】",
      summary.headline,
      summary.verdict,
      "",
      ...ranked.map((t, i) => {
        const lv = scoreToLevel(scores[t].normalized);
        return `${String(i + 1).padStart(2, "0")}. ${t} — Lv.${lv}  ${LEVEL_LABELS[lv]}`;
      }),
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
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      const { toBlob } = await import("html-to-image");
      const blob = await toBlob(saveRef.current, {
        pixelRatio: 2,
        backgroundColor: "#141414",
        cacheBust: true,
      });
      if (!blob) throw new Error("blob");

      const filename = "watashi-no-teigi.png";
      const file = new File([blob], filename, { type: "image/png" });

      // iOS/Android: native share sheet (lets the user save to Photos).
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({ files: [file] });
          return;
        } catch (err) {
          // User cancelled the share sheet — not an error.
          if ((err as DOMException)?.name === "AbortError") return;
          // Fall through to download fallback on other errors.
        }
      }

      // Desktop / browsers without file-share support: download link.
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
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
    <div className="fade-in min-h-dscreen flex flex-col safe-x">
      <header className="px-6 md:px-16 pt-10 safe-top flex items-center justify-between hairline-b pb-6">
        <span className="caption">Certificate № 001</span>
        <span className="caption index-num">
          {answeredCount} / {SCENES.length} responses
        </span>
      </header>

      <main className="max-w-3xl w-full mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Share card — single-screenshot capture target */}
        <div className="flex justify-center mb-10">
          <ShareCard
            ref={saveRef}
            summary={summary}
            scores={scores}
            topFive={topFive}
            primaryCollapse={primaryCollapse}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-16">
          <button
            onClick={copy}
            className="btn-ghost py-3 font-display tracking-[0.15em] text-sm"
          >
            文字を写す
          </button>
          <button
            onClick={savePng}
            disabled={saving}
            className="btn-ghost py-3 font-display tracking-[0.15em] text-sm disabled:opacity-50"
          >
            {saving ? "生成中…" : "画像で保存"}
          </button>
          <button
            onClick={onRestart}
            className="btn-primary py-3 font-display tracking-[0.15em] text-sm"
          >
            もう一度、問う
          </button>
        </div>

        <section className="mb-20">
          <Header label="重要度の序列" sub="Traits, ranked by centrality" />
          <div className="hairline-t">
            {ranked.map((trait, i) => {
              const s = scores[trait];
              const lv = scoreToLevel(s.normalized);
              return (
                <div
                  key={trait}
                  className="hairline-b py-6 grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_auto] gap-x-4 md:gap-x-8 gap-y-2 items-start"
                >
                  <span className="caption index-num w-8 mt-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-3 mb-1 md:block">
                      <div className="font-display text-xl md:text-2xl">
                        {trait}
                      </div>
                      <div className="font-latin text-base tabular-nums text-[color:var(--cream)] md:hidden">
                        Lv.{lv}
                      </div>
                    </div>
                    <div className="text-xs text-[color:var(--cream-mute)]">
                      {TRAIT_DESCRIPTIONS[trait]}
                    </div>
                    <div className="caption mt-2 text-[color:var(--cream-mute)] md:hidden">
                      {LEVEL_LABELS[lv]}
                    </div>
                    <blockquote className="mt-3 font-display text-sm md:text-base leading-[1.9] text-[color:var(--cream)] border-l border-[color:var(--ink-line)] pl-4">
                      「{voiceFor(trait, lv)}」
                    </blockquote>
                    <div className="mt-3 bar-track h-px w-full">
                      <div
                        className="bar-fill h-px"
                        style={{ width: `${Math.max(2, s.normalized)}%` }}
                      />
                    </div>
                  </div>
                  <div className="hidden md:block text-right">
                    <div className="font-latin text-lg md:text-2xl tabular-nums text-[color:var(--cream)]">
                      Lv.{lv}
                    </div>
                    <div className="caption mt-1 text-[color:var(--cream-mute)] whitespace-nowrap">
                      {LEVEL_LABELS[lv]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-[color:var(--cream-mute)] mt-4 leading-relaxed">
            Lv.1 はその要素が自己と無関係であることを、Lv.5 はそれが自分そのものであることを示す。
            引用は各レベルで本人が抱きうる感覚の言葉。
          </p>
        </section>

        <section className="mb-20">
          <Header
            label="崩壊点"
            sub="Thresholds at which self-identity collapses"
          />
          <div className="hairline-t">
            {thresholds
              .filter((t) => t.confidence !== "low" && t.collapseAt != null)
              .sort((a, b) => (b.collapseAt ?? 0) - (a.collapseAt ?? 0))
              .map((t) => {
                const lv = scoreToLevel(t.collapseAt ?? 0);
                return (
                  <div key={t.trait} className="hairline-b py-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-lg">{t.trait}</span>
                      <span className="font-latin tabular-nums text-[color:var(--cream-dim)] shrink-0">
                        Lv.{lv}
                        {t.confidence === "mid" && (
                          <span className="caption ml-2">参考</span>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-[color:var(--cream-mute)] leading-relaxed mt-1">
                      {COLLAPSE_LEVEL_LABELS[lv]}
                    </p>
                  </div>
                );
              })}
          </div>
          <p className="text-xs text-[color:var(--cream-mute)] mt-4 leading-relaxed">
            各軸がどれだけ損なわれたとき、あなたが「もう自分ではない」と感じるか。
            Lv. が高いほど、わずかな損失でも自己が崩れる。「参考」はサンプルが少なく、精度が低い。
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
            <dt className="text-[color:var(--cream-mute)]">自分と認めた設問</dt>
            <dd className="font-latin tabular-nums text-right">{yesCount}</dd>
            <dt className="text-[color:var(--cream-mute)]">自己の中心</dt>
            <dd className="font-display text-right">{summary.primary ?? "—"}</dd>
            <dt className="text-[color:var(--cream-mute)]">変化に強い領域</dt>
            <dd className="font-display text-right">
              {summary.robust.slice(0, 2).join(" · ") || "—"}
            </dd>
          </dl>
        </section>

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
      </main>

      <footer className="hairline-t px-6 md:px-16 py-6 safe-bottom flex items-center justify-between">
        <span className="caption">わたしの定義</span>
        <span className="caption">watashi no teigi</span>
      </footer>
    </div>
  );
}

type ShareCardProps = {
  summary: Summary;
  scores: Scores;
  topFive: TraitKey[];
  primaryCollapse: number | null;
  ref?: React.Ref<HTMLDivElement>;
};

function ShareCard({
  ref,
  summary,
  scores,
  topFive,
  primaryCollapse,
}: ShareCardProps) {
  return (
    <div
      ref={ref}
      className="w-full max-w-[480px] mx-auto bg-[color:var(--ink)] border border-[color:var(--ink-line)] p-8 md:p-10 flex flex-col"
      style={{ aspectRatio: "4 / 5" }}
    >
      <div className="flex items-center justify-between">
        <span className="caption">— 鑑定書 —</span>
        <span className="caption index-num">№ 001</span>
      </div>

      <div className="text-center mt-6 mb-5">
        <h2 className="font-display text-3xl md:text-4xl tracking-[0.12em] leading-[1.4]">
          わたしの定義
        </h2>
        <Ornament className="text-[color:var(--cream-mute)] mx-auto mt-4" />
      </div>

      <div className="text-center px-1">
        <p className="font-display text-[15px] md:text-base leading-[2] text-[color:var(--cream)]">
          {summary.headline}
        </p>
        <p className="font-display text-[13px] md:text-sm leading-[2] text-[color:var(--cream-dim)] mt-1">
          {summary.verdict}
        </p>
      </div>

      <div className="rule-thin my-5" />

      <div className="space-y-3 flex-1">
        {topFive.map((trait, i) => {
          const s = scores[trait];
          const lv = scoreToLevel(s.normalized);
          return (
            <div
              key={trait}
              className="grid grid-cols-[auto_1fr_auto] gap-3 items-center"
            >
              <span className="caption index-num w-5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="font-display text-sm md:text-base mb-1.5 leading-none">
                  {trait}
                </div>
                <div className="bar-track h-px w-full">
                  <div
                    className="bar-fill h-px"
                    style={{ width: `${Math.max(2, s.normalized)}%` }}
                  />
                </div>
              </div>
              <span className="font-latin tabular-nums text-sm md:text-base text-[color:var(--cream)]">
                Lv.{lv}
              </span>
            </div>
          );
        })}
      </div>

      <div className="rule-thin my-4" />

      <div className="text-center">
        <p className="caption leading-relaxed">
          {summary.primary ? (
            <>
              核 : <span className="text-[color:var(--cream)]">{summary.primary}</span>
              {primaryCollapse != null && (
                <>
                  {"  ·  "}
                  崩壊 :{" "}
                  <span className="text-[color:var(--cream)]">
                    Lv.{scoreToLevel(primaryCollapse)}
                  </span>
                </>
              )}
            </>
          ) : (
            <span className="text-[color:var(--cream-dim)]">自己の中心、未定</span>
          )}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="caption">わたしの定義</span>
        <span className="caption">watashi no teigi</span>
      </div>
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
