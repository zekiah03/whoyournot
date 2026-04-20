"use client";

import { useMemo, useState } from "react";
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
  onFinish: (answers: Answer[]) => void;
  onCancel: () => void;
};

const SWIPE_THRESHOLD = 120;

export default function Quiz({ scenes, onFinish, onCancel }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [exit, setExit] = useState<Choice | null>(null);

  const scene = scenes[index];
  const progress = useMemo(
    () => Math.round((index / scenes.length) * 100),
    [index, scenes.length]
  );

  const register = (choice: Choice) => {
    const next = [...answers, { sceneId: scene.id, choice }];
    if (index + 1 >= scenes.length) {
      onFinish(next);
      return;
    }
    setAnswers(next);
    setIndex(index + 1);
    setExit(null);
  };

  const answer = (choice: Choice) => {
    setExit(choice);
    window.setTimeout(() => register(choice), 220);
  };

  const goBack = () => {
    if (index === 0) {
      onCancel();
      return;
    }
    setAnswers(answers.slice(0, -1));
    setIndex(index - 1);
    setExit(null);
  };

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
        <div className="caption index-num">
          № {String(index + 1).padStart(2, "0")} /{" "}
          {String(scenes.length).padStart(2, "0")}
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
        <p className="font-display text-center text-xl md:text-2xl tracking-[0.2em] text-[color:var(--cream)] mb-2">
          直感で。
        </p>
        <p className="font-display text-center text-base md:text-lg tracking-[0.2em] text-[color:var(--cream-mute)]">
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
            <span className="caption">SWIPE</span>
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
