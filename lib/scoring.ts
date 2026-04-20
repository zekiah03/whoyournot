import { Scene, TraitKey, TRAIT_KEYS } from "./scenes";

export type Choice = "yes" | "no";

export type Answer = {
  sceneId: number;
  choice: Choice;
};

/**
 * Unified trait score.
 * - `weightSum` is the total "testing weight" this trait has received
 *   (each scene contributes `100 - tag` = how much that scene challenges the trait).
 * - `importance` accumulates signed weights: +weight on ❌ (you defend the trait),
 *   -weight on ⭕ (you tolerate the loss).
 * - `normalized` rescales importance to 0..100 where 50 is neutral,
 *   100 is "this trait is absolutely essential to my identity",
 *   0 is "this trait is irrelevant to my identity".
 */
export type TraitScore = {
  importance: number;
  weightSum: number;
  normalized: number;
  count: number;
  yesCount: number;
  noCount: number;
};

export type Scores = Record<TraitKey, TraitScore>;

export function computeScores(answers: Answer[], scenes: Scene[]): Scores {
  const sceneById = new Map(scenes.map((s) => [s.id, s]));
  const scores = {} as Scores;

  for (const trait of TRAIT_KEYS) {
    scores[trait] = {
      importance: 0,
      weightSum: 0,
      normalized: 50,
      count: 0,
      yesCount: 0,
      noCount: 0,
    };
  }

  for (const answer of answers) {
    const scene = sceneById.get(answer.sceneId);
    if (!scene) continue;
    for (const trait of TRAIT_KEYS) {
      const tag = scene.tags[trait];
      if (tag == null) continue;
      const weight = 100 - tag; // how much this scene challenges the trait
      const s = scores[trait];
      s.weightSum += weight;
      s.count += 1;
      if (answer.choice === "yes") {
        s.importance -= weight;
        s.yesCount += 1;
      } else {
        s.importance += weight;
        s.noCount += 1;
      }
    }
  }

  for (const trait of TRAIT_KEYS) {
    const s = scores[trait];
    if (s.weightSum > 0) {
      s.normalized = Math.round(50 + (50 * s.importance) / s.weightSum);
    }
  }

  return scores;
}

export type Threshold = {
  trait: TraitKey;
  minAccepted: number | null;
  maxRejected: number | null;
  collapseAt: number | null;
  count: number;
  confidence: "low" | "mid" | "high";
};

export function computeThresholds(
  answers: Answer[],
  scenes: Scene[]
): Threshold[] {
  const sceneById = new Map(scenes.map((s) => [s.id, s]));
  return TRAIT_KEYS.map((trait) => {
    const yesTags: number[] = [];
    const noTags: number[] = [];
    for (const a of answers) {
      const scene = sceneById.get(a.sceneId);
      if (!scene) continue;
      const tag = scene.tags[trait];
      if (tag == null) continue;
      if (a.choice === "yes") yesTags.push(tag);
      else noTags.push(tag);
    }
    const minAccepted = yesTags.length > 0 ? Math.min(...yesTags) : null;
    const maxRejected = noTags.length > 0 ? Math.max(...noTags) : null;
    let collapseAt: number | null = null;
    if (minAccepted != null && maxRejected != null) {
      collapseAt = Math.round((minAccepted + maxRejected) / 2);
    } else if (minAccepted != null) {
      collapseAt = Math.max(0, minAccepted - 5);
    } else if (maxRejected != null) {
      collapseAt = Math.min(100, maxRejected + 5);
    }
    const total = yesTags.length + noTags.length;
    const confidence: Threshold["confidence"] =
      total >= 6 ? "high" : total >= 3 ? "mid" : "low";
    return {
      trait,
      minAccepted,
      maxRejected,
      collapseAt,
      count: total,
      confidence,
    };
  });
}

export type CategoryInsight = {
  category: string;
  yes: number;
  no: number;
  total: number;
  tendency: "受容" | "拒絶" | "半々" | "不明";
};

export function computeCategoryInsights(
  answers: Answer[],
  scenes: Scene[]
): CategoryInsight[] {
  const sceneById = new Map(scenes.map((s) => [s.id, s]));
  const buckets = new Map<string, { yes: number; no: number }>();
  for (const a of answers) {
    const scene = sceneById.get(a.sceneId);
    if (!scene) continue;
    const b = buckets.get(scene.category) ?? { yes: 0, no: 0 };
    if (a.choice === "yes") b.yes += 1;
    else b.no += 1;
    buckets.set(scene.category, b);
  }
  return Array.from(buckets.entries()).map(([category, { yes, no }]) => {
    const total = yes + no;
    let tendency: CategoryInsight["tendency"] = "不明";
    if (total > 0) {
      const ratio = yes / total;
      if (ratio >= 0.7) tendency = "受容";
      else if (ratio <= 0.3) tendency = "拒絶";
      else tendency = "半々";
    }
    return { category, yes, no, total, tendency };
  });
}

export type Summary = {
  primary: TraitKey | null;
  secondary: TraitKey | null;
  robust: TraitKey[];
  headline: string;
  verdict: string;
  essence: string;
  pattern: "core" | "dual" | "flat" | "dissolution" | "defense" | "sparse";
};

/**
 * Compose a personalized, specific summary from the actual answer pattern.
 * Uses thresholds and normalized scores to produce a sentence that reflects
 * *how* the user defines themselves, not just *what* they care about.
 */
export function buildSummary(
  scores: Scores,
  thresholds: Threshold[],
  answers: Answer[]
): Summary {
  const ranked = [...TRAIT_KEYS]
    .filter((t) => scores[t].count >= 2)
    .sort((a, b) => scores[b].normalized - scores[a].normalized);

  const thresholdByTrait = new Map(thresholds.map((t) => [t.trait, t]));

  const primary = ranked[0] ?? null;
  const secondary = ranked[1] ?? null;
  const robust = ranked.slice(-3).reverse();
  const totalAnswers = answers.length;
  const yesRate =
    totalAnswers > 0
      ? answers.filter((a) => a.choice === "yes").length / totalAnswers
      : 0;

  // Pattern detection
  let pattern: Summary["pattern"] = "flat";
  const highScore = primary ? scores[primary].normalized : 50;
  const lowScore =
    ranked.length > 0 ? scores[ranked[ranked.length - 1]].normalized : 50;
  const spread = highScore - lowScore;

  if (ranked.length === 0) {
    pattern = "sparse";
  } else if (yesRate >= 0.85) {
    pattern = "dissolution";
  } else if (yesRate <= 0.15) {
    pattern = "defense";
  } else if (highScore >= 75 && spread >= 30) {
    pattern = "core";
  } else if (highScore >= 65 && secondary && scores[secondary].normalized >= 60) {
    pattern = "dual";
  } else {
    pattern = "flat";
  }

  let headline = "";
  let verdict = "";
  let essence = "";

  const collapse = (t: TraitKey | null) =>
    t ? thresholdByTrait.get(t)?.collapseAt ?? null : null;

  switch (pattern) {
    case "core": {
      const p = primary!;
      const cp = collapse(p);
      const r = robust[0] && robust[0] !== p ? robust[0] : null;
      headline = r
        ? `${r}が変わっても、あなたは揺らがない。`
        : `あなたの核は「${p}」。`;
      verdict = cp
        ? `ただし${p}が${cp}%を下回ると、あなたは自分を失う。`
        : `${p}こそが、あなたを成立させている。`;
      essence = `自己の中心は「${p}」。他の変化には比較的強い。`;
      break;
    }
    case "dual": {
      const p = primary!;
      const s = secondary!;
      headline = `あなたは「${p}」と「${s}」の二本柱で立っている。`;
      verdict = `どちらか一方が崩れれば、あなたは自分でなくなる。`;
      essence = `単一の軸ではなく、${p}と${s}の組み合わせで自分を定義している。`;
      break;
    }
    case "flat": {
      headline = `あなたは自分を、特定の一点には定めていない。`;
      verdict = `どの要素が欠けても、あなたはあなたでいられる――しなやかに。`;
      essence = `自己の輪郭が分散している。変化への耐性が高い。`;
      break;
    }
    case "dissolution": {
      headline = `あなたは、ほぼすべての変化を受容する。`;
      verdict = `輪郭そのものがあなたらしさ。自己という枠に執着がない。`;
      essence = `自己を固定された一つの何かとは捉えていない。流動的な存在。`;
      break;
    }
    case "defense": {
      headline = `あなたは、変化の大半を拒絶する。`;
      verdict = `今ある自分そのものへの信頼が強い。境界線は明確。`;
      essence = `現状の自分こそが自分。あらゆる変質を自己の喪失とみなす。`;
      break;
    }
    case "sparse": {
      headline = `データが足りない。もう少し多くの問いが必要だ。`;
      verdict = `より長いモードで、もう一度試してみてください。`;
      essence = `判定不能。`;
      break;
    }
  }

  return { primary, secondary, robust, headline, verdict, essence, pattern };
}

export function rankedTraits(scores: Scores): TraitKey[] {
  return [...TRAIT_KEYS]
    .filter((t) => scores[t].count > 0)
    .sort((a, b) => scores[b].normalized - scores[a].normalized);
}
