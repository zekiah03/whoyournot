"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "motion/react";
import { Scene } from "@/lib/scenes";
import { Answer, Choice } from "@/lib/scoring";
import { IconArrow, IconCircle, IconCross } from "./icons";

type Props = {
  scenes: Scene[];
  startIndex?: number;
  initialAnswers?: Answer[];
  onProgress?: (answers: Answer[], index: number) => void;
  onFinish: (answers: Answer[]) => void;
  onCancel: () => void;
};

const SWIPE_THRESHOLD = 120;

export default function Quiz({
  scenes,
  startIndex = 0,
  initialAnswers = [],
  onProgress,
  onFinish,
  onCancel,
}: Props) {
  const [index, setIndex] = useState(startIndex);
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
  const [exit, setExit] = useState<Choice | null>(null);
  const [busy, setBusy] = useState(false);

  const scene = scenes[index];
  const progress = useMemo(
    () => Math.round((index / scenes.length) * 100),
    [index, scenes.length]
  );

  const chapter = useMemo(() => {
    const seen = new Set<string>();
    for (let i = 0; i <= index; i++) {
      const c = scenes[i]?.category;
      if (c) seen.add(c);
    }
    return {
      number: seen.size,
      name: scene?.category ?? "",
    };
  }, [index, scenes, scene]);

  const register = useCallback(
    (choice: Choice) => {
      const nextAnswers = [...answers, { sceneId: scene.id, choice }];
      const nextIndex = index + 1;
      if (nextIndex >= scenes.length) {
        onFinish(nextAnswers);
        return;
      }
      setAnswers(nextAnswers);
      setIndex(nextIndex);
      setExit(null);
      setBusy(false);
      onProgress?.(nextAnswers, nextIndex);
    },
    [answers, index, onFinish, onProgress, scene, scenes.length]
  );

  const answer = useCallback(
    (choice: Choice) => {
      if (busy) return;
      setBusy(true);
      setExit(choice);
      window.setTimeout(() => register(choice), 220);
    },
    [busy, register]
  );

  const goBack = useCallback(() => {
    if (index === 0) {
      onCancel();
      return;
    }
    const nextAnswers = answers.slice(0, -1);
    const nextIndex = index - 1;
    setAnswers(nextAnswers);
    setIndex(nextIndex);
    setExit(null);
    onProgress?.(nextAnswers, nextIndex);
  }, [answers, index, onCancel, onProgress]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        answer("yes");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        answer("no");
      } else if (e.key === "Backspace") {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [answer, goBack]);

  if (!scene) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 md:px-16 pt-8 flex items-center justify-between hairline-b pb-6">
        <button
          onClick={goBack}
          className="caption flex items-center gap-2 hover:text-[color:var(--cream)] transition-colors"
        >
          <IconArrow size={12} direction="left" />
          {index === 0 ? "退室" : "前へ"}
        </button>
        <div className="flex items-baseline gap-4">
          <span className="caption">
            第{toKanjiNumeral(chapter.number)}章 · {chapter.name}
          </span>
          <span className="caption index-num">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(scenes.length).padStart(2, "0")}
          </span>
        </div>
      </header>

      <div className="h-px w-full">
        <div
          className="h-px bg-[color:var(--cream-dim)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-16 py-8 relative">
        <AnimatePresence mode="wait">
          <SceneCard
            key={scene.id}
            scene={scene}
            exit={exit}
            onAnswer={answer}
          />
        </AnimatePresence>
      </main>

      <section className="px-6 md:px-16 pb-10">
        <p className="font-display text-center text-2xl md:text-3xl tracking-[0.25em] text-[color:var(--cream)] mb-2">
          直感で。
        </p>
        <p className="font-display text-center text-lg md:text-xl tracking-[0.25em] text-[color:var(--cream-mute)]">
          考え込まないで。
        </p>

        <div className="mt-10 flex items-center justify-center gap-14 md:gap-24">
          <button
            onClick={() => answer("no")}
            aria-label="自分じゃない"
            className="btn-ghost rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center group"
          >
            <IconCross
              size={36}
              stroke={1.2}
              className="text-[color:var(--cream-dim)] group-hover:text-[color:var(--cream)] transition-colors"
            />
          </button>
          <div className="flex flex-col items-center gap-1">
            <span className="caption">SWIPE · ← →</span>
            <div className="flex gap-2 text-[color:var(--cream-mute)]">
              <IconArrow size={14} direction="left" />
              <IconArrow size={14} />
            </div>
          </div>
          <button
            onClick={() => answer("yes")}
            aria-label="自分だ"
            className="btn-ghost rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center group"
          >
            <IconCircle
              size={36}
              stroke={1.2}
              className="text-[color:var(--cream-dim)] group-hover:text-[color:var(--cream)] transition-colors"
            />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-16 md:gap-28 caption">
          <span>左 : 自分じゃない</span>
          <span>右 : 自分だ</span>
        </div>
      </section>
    </div>
  );
}

function SceneCard({
  scene,
  exit,
  onAnswer,
}: {
  scene: Scene;
  exit: Choice | null;
  onAnswer: (c: Choice) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-8, 0, 8]);
  const yesOpacity = useTransform(x, [30, 160], [0, 1]);
  const noOpacity = useTransform(x, [-160, -30], [1, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) onAnswer("yes");
    else if (info.offset.x < -SWIPE_THRESHOLD) onAnswer("no");
  };

  const exitX = exit === "yes" ? 600 : exit === "no" ? -600 : 0;

  return (
    <motion.article
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      style={{ x, rotate }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        x: exitX,
        opacity: 0,
        transition: { duration: 0.22, ease: "easeIn" },
      }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="plaque relative w-full max-w-2xl px-8 md:px-14 py-14 md:py-20 cursor-grab active:cursor-grabbing select-none touch-none"
    >
      <div className="flex items-center justify-between mb-10">
        <span className="caption index-num">{scene.category}</span>
        <span className="caption index-num">
          Scene {String(scene.id).padStart(3, "0")}
        </span>
      </div>

      <p className="font-display text-3xl md:text-5xl leading-[1.7] md:leading-[1.7] font-normal text-[color:var(--cream)]">
        {scene.text}
      </p>

      <div className="mt-12 rule-thin" />
      <p className="caption mt-6 text-center">
        ——　それでも、あなたは「あなた」ですか。　——
      </p>

      <motion.div
        style={{ opacity: yesOpacity }}
        className="pointer-events-none absolute top-8 right-8 caption border border-[color:var(--cream)] text-[color:var(--cream)] px-3 py-1"
      >
        自分だ
      </motion.div>
      <motion.div
        style={{ opacity: noOpacity }}
        className="pointer-events-none absolute top-8 left-8 caption border border-[color:var(--cream)] text-[color:var(--cream)] px-3 py-1"
      >
        自分じゃない
      </motion.div>
    </motion.article>
  );
}

function toKanjiNumeral(n: number): string {
  const k = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  if (n <= 10) return k[n] ?? String(n);
  if (n < 20) return "十" + k[n - 10];
  return String(n);
}
