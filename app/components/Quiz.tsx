"use client";

import { useMemo, useState } from "react";
import { Scene } from "@/lib/scenes";
import { Answer, Choice } from "@/lib/scoring";

type Props = {
  scenes: Scene[];
  onFinish: (answers: Answer[]) => void;
  onCancel: () => void;
};

export default function Quiz({ scenes, onFinish, onCancel }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [key, setKey] = useState(0);

  const scene = scenes[index];
  const progress = useMemo(
    () => Math.round((index / scenes.length) * 100),
    [index, scenes.length]
  );

  const answer = (choice: Choice) => {
    const next = [...answers, { sceneId: scene.id, choice }];
    if (index + 1 >= scenes.length) {
      onFinish(next);
      return;
    }
    setAnswers(next);
    setIndex(index + 1);
    setKey((k) => k + 1);
  };

  const goBack = () => {
    if (index === 0) {
      onCancel();
      return;
    }
    setAnswers(answers.slice(0, -1));
    setIndex(index - 1);
    setKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goBack}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {index === 0 ? "← トップへ" : "← 戻る"}
        </button>
        <span className="text-xs text-zinc-500 tabular-nums">
          {index + 1} / {scenes.length}
        </span>
      </div>

      <div className="h-1 w-full bg-white/5 rounded-full mb-12 overflow-hidden">
        <div
          className="progress-bar h-full rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div key={key} className="fade-in flex-1 flex flex-col justify-center">
        <div className="mb-2 flex gap-2 flex-wrap">
          <span className="text-[10px] tracking-wider text-[color:var(--accent)] uppercase">
            #{scene.id}
          </span>
          <span className="text-[10px] tracking-wider text-zinc-500 uppercase">
            {scene.category}
          </span>
        </div>

        <p className="text-2xl md:text-3xl font-semibold leading-relaxed mb-4">
          {scene.text}
        </p>
        <p className="text-sm text-zinc-500 mb-12">
          それでも、あなたは「あなた」ですか？
        </p>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <button
            onClick={() => answer("yes")}
            className="btn-yes text-white rounded-2xl py-6 md:py-8 font-bold text-lg md:text-xl active:scale-[0.98] transition-transform"
          >
            <div className="text-3xl mb-1">⭕</div>
            <div>自分だ</div>
          </button>
          <button
            onClick={() => answer("no")}
            className="btn-no text-white rounded-2xl py-6 md:py-8 font-bold text-lg md:text-xl active:scale-[0.98] transition-transform"
          >
            <div className="text-3xl mb-1">❌</div>
            <div>自分じゃない</div>
          </button>
        </div>
      </div>

      <p className="text-[10px] text-zinc-600 text-center mt-6">
        直感で。考え込まないで。
      </p>
    </div>
  );
}
