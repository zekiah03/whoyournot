"use client";

type Props = {
  onStart: (count: number) => void;
  total: number;
};

const OPTIONS = [
  { count: 20, label: "ライト", desc: "20問 / 約3分" },
  { count: 40, label: "スタンダード", desc: "40問 / 約6分" },
  { count: 100, label: "フル", desc: "全100問 / じっくり" },
];

export default function Intro({ onStart, total }: Props) {
  return (
    <div className="fade-in max-w-2xl mx-auto px-6 py-16 md:py-24">
      <p className="text-xs tracking-[0.3em] text-[color:var(--accent)] mb-4">
        THOUGHT EXPERIMENT · 100
      </p>
      <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
        Who You&apos;re <span className="text-[color:var(--accent)]">Not</span>
      </h1>
      <p className="text-lg md:text-xl text-zinc-300 mb-4 leading-relaxed">
        記憶を失ったら、体が変わったら、あなたのコピーが現れたら――
        <br />
        それでも、あなたは「あなた」だと言えますか？
      </p>
      <p className="text-sm text-zinc-500 mb-10 leading-relaxed">
        {total}個の思考実験に⭕❌で答えてください。最後にあなたが“自分”を何で定義しているかが浮かび上がります。
      </p>

      <div className="grid gap-3 mb-8">
        {OPTIONS.map((opt) => (
          <button
            key={opt.count}
            onClick={() => onStart(opt.count)}
            className="bg-card rounded-xl px-5 py-4 text-left hover:border-[color:var(--accent)]/50 hover:bg-[color:var(--accent-soft)] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-base">{opt.label}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{opt.desc}</div>
              </div>
              <div className="text-zinc-500 group-hover:text-[color:var(--accent)] transition-colors">
                →
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="text-xs text-zinc-600 leading-relaxed border-t border-white/5 pt-6">
        <p className="mb-1">
          ⭕ = それでも “自分” だと思う ／ ❌ = もう “自分” ではない
        </p>
        <p>考え込まず、直感で答えてください。所要時間は目安です。</p>
      </div>
    </div>
  );
}
