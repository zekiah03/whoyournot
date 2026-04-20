import { Scene, TraitKey, TRAIT_KEYS } from "./scenes";

export type Choice = "yes" | "no";

export type Answer = {
  sceneId: number;
  choice: Choice;
};

export type TraitScore = {
  raw: number;
  max: number;
  normalized: number;
  importance: number;
  count: number;
};

export type Scores = Record<TraitKey, TraitScore>;

export function computeScores(answers: Answer[], scenes: Scene[]): Scores {
  const sceneById = new Map(scenes.map((s) => [s.id, s]));
  const scores: Scores = {} as Scores;

  for (const trait of TRAIT_KEYS) {
    scores[trait] = { raw: 0, max: 0, normalized: 50, importance: 0, count: 0 };
  }

  for (const answer of answers) {
    const scene = sceneById.get(answer.sceneId);
    if (!scene) continue;

    for (const trait of TRAIT_KEYS) {
      const tag = scene.tags[trait];
      if (tag == null) continue;
      const s = scores[trait];
      s.max += 100;
      s.count += 1;
      if (answer.choice === "yes") {
        s.raw += tag;
        s.importance -= 100 - tag;
      } else {
        s.raw -= tag;
        s.importance += 100 - tag;
      }
    }
  }

  for (const trait of TRAIT_KEYS) {
    const s = scores[trait];
    if (s.max > 0) {
      s.normalized = Math.round(50 + (50 * s.raw) / s.max);
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
    return {
      trait,
      minAccepted,
      maxRejected,
      collapseAt,
      count: yesTags.length + noTags.length,
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
};

export function buildSummary(scores: Scores): Summary {
  const sorted = [...TRAIT_KEYS]
    .filter((t) => scores[t].count > 0)
    .sort((a, b) => scores[b].importance - scores[a].importance);

  const primary = sorted[0] ?? null;
  const secondary = sorted[1] ?? null;
  const robust = sorted.slice(-3).reverse();

  let headline = "自己の輪郭が曖昧。揺らぎそのものが、あなたらしさかもしれない。";
  let verdict = "あなたは自分を\u201c固定された一つの何か\u201dとは定義していない。";

  if (primary) {
    const primaryImportance = scores[primary].importance;
    if (primaryImportance > 80) {
      headline = `あなたの核は「${primary}」。ここが壊れたとき、あなたは自分でなくなる。`;
      verdict = `\u201c${primary}\u201dこそがあなたの自己同一性の中心。他の変化には比較的強い。`;
    } else if (primaryImportance > 30) {
      headline = `あなたは「${primary}」を軸にしながら、複数の要素で自分を定義している。`;
      verdict = `${primary}${secondary ? `と${secondary}` : ""}の両方が\u201cあなた\u201dを成立させている。`;
    } else if (primaryImportance > -30) {
      headline = "どの要素が欠けても、あなたはあなたでいられる――かもしれない。";
      verdict = "変化への耐性が高い。自己の定義がしなやか。";
    } else {
      headline = "あなたは\u201c自分\u201dをほとんど手放している。";
      verdict = "変化のほぼすべてを受け入れる。自己の枠がとても薄い。";
    }
  }

  return { primary, secondary, robust, headline, verdict };
}
