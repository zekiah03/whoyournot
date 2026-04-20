"use client";

import { useMemo, useState } from "react";
import Intro from "./components/Intro";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import { SCENES, Scene } from "@/lib/scenes";
import { Answer } from "@/lib/scoring";

type Phase = "intro" | "quiz" | "result";

function pickScenes(count: number): Scene[] {
  if (count >= SCENES.length) return [...SCENES];
  const pool = [...SCENES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [selected, setSelected] = useState<Scene[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const total = useMemo(() => SCENES.length, []);

  const start = (count: number) => {
    setSelected(pickScenes(count));
    setAnswers([]);
    setPhase("quiz");
  };

  const finish = (result: Answer[]) => {
    setAnswers(result);
    setPhase("result");
  };

  const restart = () => {
    setAnswers([]);
    setSelected([]);
    setPhase("intro");
  };

  return (
    <main className="flex-1">
      {phase === "intro" && <Intro onStart={start} total={total} />}
      {phase === "quiz" && (
        <Quiz scenes={selected} onFinish={finish} onCancel={restart} />
      )}
      {phase === "result" && <Result answers={answers} onRestart={restart} />}
    </main>
  );
}
