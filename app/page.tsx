"use client";

import { useEffect, useMemo, useState } from "react";
import Intro from "./components/Intro";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import { SCENES, Scene } from "@/lib/scenes";
import { Answer } from "@/lib/scoring";
import { pickScenes } from "@/lib/sampling";
import {
  SavedSession,
  clearSession,
  loadSession,
  saveSession,
} from "@/lib/storage";

type Phase = "intro" | "quiz" | "result";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [selected, setSelected] = useState<Scene[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [index, setIndex] = useState(0);
  const [resumable, setResumable] = useState<SavedSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const total = useMemo(() => SCENES.length, []);

  useEffect(() => {
    const saved = loadSession();
    if (saved && saved.answers.length > 0 && saved.answers.length < saved.sceneIds.length) {
      setResumable(saved);
    }
    setHydrated(true);
  }, []);

  const start = (count: number) => {
    const picked = pickScenes(count);
    setSelected(picked);
    setAnswers([]);
    setIndex(0);
    setPhase("quiz");
    saveSession({
      sceneIds: picked.map((s) => s.id),
      answers: [],
      index: 0,
      startedAt: Date.now(),
    });
  };

  const resume = () => {
    if (!resumable) return;
    const byId = new Map(SCENES.map((s) => [s.id, s]));
    const scenes = resumable.sceneIds
      .map((id) => byId.get(id))
      .filter((s): s is Scene => Boolean(s));
    if (scenes.length === 0) {
      clearSession();
      setResumable(null);
      return;
    }
    setSelected(scenes);
    setAnswers(resumable.answers);
    setIndex(resumable.index);
    setPhase("quiz");
  };

  const discardResume = () => {
    clearSession();
    setResumable(null);
  };

  const progress = (nextAnswers: Answer[], nextIndex: number) => {
    setAnswers(nextAnswers);
    setIndex(nextIndex);
    saveSession({
      sceneIds: selected.map((s) => s.id),
      answers: nextAnswers,
      index: nextIndex,
      startedAt: Date.now(),
    });
  };

  const finish = (result: Answer[]) => {
    setAnswers(result);
    setPhase("result");
    clearSession();
  };

  const restart = () => {
    setAnswers([]);
    setSelected([]);
    setIndex(0);
    setPhase("intro");
    clearSession();
    setResumable(null);
  };

  if (!hydrated) {
    return <main className="flex-1" />;
  }

  return (
    <main className="flex-1 grain">
      {phase === "intro" && (
        <Intro
          onStart={start}
          onResume={resume}
          onDiscardResume={discardResume}
          resumable={resumable}
          total={total}
        />
      )}
      {phase === "quiz" && (
        <Quiz
          scenes={selected}
          startIndex={index}
          initialAnswers={answers}
          onProgress={progress}
          onFinish={finish}
          onCancel={restart}
        />
      )}
      {phase === "result" && <Result answers={answers} onRestart={restart} />}
    </main>
  );
}
