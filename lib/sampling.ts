import { SCENES, Scene } from "./scenes";

const CATEGORY_ORDER = [
  "記憶",
  "体",
  "意識",
  "コピー",
  "時間",
  "空間",
  "価値観",
  "行動",
  "存在",
  "複合",
  "境界",
];

function categoryRank(c: string): number {
  const i = CATEGORY_ORDER.indexOf(c);
  return i === -1 ? 999 : i;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Stratified sampling: allocate roughly proportional slots per category,
 * guaranteeing at least one from every category present (when N >= #categories).
 * Result is ordered by category (for chapter flow), shuffled within category.
 */
export function pickScenes(n: number): Scene[] {
  if (n >= SCENES.length) {
    const ordered = [...SCENES].sort(
      (a, b) => categoryRank(a.category) - categoryRank(b.category)
    );
    return ordered;
  }

  const byCat = new Map<string, Scene[]>();
  for (const s of SCENES) {
    const arr = byCat.get(s.category) ?? [];
    arr.push(s);
    byCat.set(s.category, arr);
  }

  const total = SCENES.length;
  const cats = Array.from(byCat.entries());

  // Initial allocation (floor of proportional)
  const allocation = new Map<string, number>();
  let allocated = 0;
  for (const [cat, arr] of cats) {
    const target = Math.max(1, Math.floor((n * arr.length) / total));
    const take = Math.min(target, arr.length);
    allocation.set(cat, take);
    allocated += take;
  }

  // Adjust to hit exactly n
  while (allocated < n) {
    const expandable = cats.filter(
      ([cat, arr]) => (allocation.get(cat) ?? 0) < arr.length
    );
    if (expandable.length === 0) break;
    const [cat, arr] = expandable.sort(
      (a, b) =>
        b[1].length / (allocation.get(b[0]) ?? 1) -
        a[1].length / (allocation.get(a[0]) ?? 1)
    )[0];
    allocation.set(cat, (allocation.get(cat) ?? 0) + 1);
    allocated += 1;
    if (allocation.get(cat)! > arr.length) {
      allocation.set(cat, arr.length);
      allocated -= 1;
    }
  }
  while (allocated > n) {
    const shrinkable = cats.filter(([cat]) => (allocation.get(cat) ?? 0) > 1);
    if (shrinkable.length === 0) break;
    const [cat] = shrinkable.sort(
      (a, b) => (allocation.get(b[0]) ?? 0) - (allocation.get(a[0]) ?? 0)
    )[0];
    allocation.set(cat, (allocation.get(cat) ?? 0) - 1);
    allocated -= 1;
  }

  const picked: Scene[] = [];
  for (const [cat, arr] of cats) {
    const k = allocation.get(cat) ?? 0;
    picked.push(...shuffle(arr).slice(0, k));
  }

  picked.sort((a, b) => {
    const d = categoryRank(a.category) - categoryRank(b.category);
    if (d !== 0) return d;
    return a.id - b.id;
  });

  return picked;
}

export { CATEGORY_ORDER };
