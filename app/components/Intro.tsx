"use client";

import { Ornament, IconArrow } from "./icons";
import { SavedSession } from "@/lib/storage";

type Props = {
  onStart: (count: number) => void;
  onResume: () => void;
  onDiscardResume: () => void;
  resumable: SavedSession | null;
  total: number;
};

const OPTIONS = [
  { count: 20, label: "抄", desc: "20の思考実験", sub: "約3分" },
  { count: 40, label: "選", desc: "40の思考実験", sub: "約6分" },
  { count: 100, label: "全", desc: "100の思考実験", sub: "じっくり" },
];

export default function Intro({
  onStart,
  onResume,
  onDiscardResume,
  resumable,
  total,
}: Props) {
  return (
    <div className="fade-in min-h-screen flex flex-col">
      <header className="px-8 md:px-16 pt-10 flex items-center justify-between">
        <span className="caption">Exhibit № 01</span>
        <span className="caption">Room of Self-Identity</span>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24 text-center">
        <p className="caption mb-8">— {total} thought experiments —</p>

        <h1 className="font-display text-7xl md:text-9xl font-normal tracking-[0.15em] mb-10">
          わたしの定義
        </h1>

        <Ornament className="text-[color:var(--cream-mute)] mb-10" />

        <p className="font-display text-xl md:text-2xl leading-[2.2] max-w-xl mb-4 text-[color:var(--cream)]">
          記憶が、体が、意識が変わっても、
          <br />
          それでもあなたは、あなたでいられるか。
        </p>

        <p className="text-sm md:text-base text-[color:var(--cream-mute)] leading-loose max-w-lg mt-8">
          これは{total}の思考実験による、
          <br className="md:hidden" />
          自己同一性の鑑定書である。
        </p>
      </section>

      <section className="px-6 md:px-16 pb-16">
        <div className="max-w-3xl mx-auto">
          {resumable && (
            <div className="mb-10 plaque px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="caption mb-1">未完の鑑定</div>
                <div className="font-display text-lg">
                  {resumable.answers.length} / {resumable.sceneIds.length}{" "}
                  <span className="text-[color:var(--cream-mute)] text-sm">
                    問まで記録されています
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onDiscardResume}
                  className="caption hover:text-[color:var(--cream)] transition-colors px-3 py-2"
                >
                  破棄する
                </button>
                <button
                  onClick={onResume}
                  className="btn-primary px-5 py-2 font-display tracking-[0.15em]"
                >
                  続きから
                </button>
              </div>
            </div>
          )}

          <div className="hairline-t pt-8">
            <p className="caption text-center mb-8">入室</p>
            <div className="grid md:grid-cols-3 gap-px bg-[color:var(--ink-line)]">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.count}
                  onClick={() => onStart(opt.count)}
                  className="group relative bg-[color:var(--ink)] hover:bg-[color:var(--ink-soft)] px-8 py-10 transition-colors text-center"
                >
                  <div className="font-display text-5xl mb-3 text-[color:var(--cream)]">
                    {opt.label}
                  </div>
                  <div className="text-sm text-[color:var(--cream)] mb-1">
                    {opt.desc}
                  </div>
                  <div className="caption">{opt.sub}</div>
                  <div className="absolute bottom-4 right-4 text-[color:var(--cream-mute)] group-hover:text-[color:var(--cream)] transition-colors">
                    <IconArrow size={14} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="hairline-t px-8 md:px-16 py-6 flex items-center justify-between text-[color:var(--cream-mute)]">
        <span className="caption">2026 · watashi no teigi</span>
        <span className="caption">回答 : スワイプ / ← → / 円・斜線</span>
      </footer>
    </div>
  );
}
