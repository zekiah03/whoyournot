export type TraitKey =
  | "意識"
  | "記憶"
  | "体"
  | "価値観"
  | "行動"
  | "時間"
  | "空間"
  | "次元"
  | "視点"
  | "存在"
  | "関係";

export const TRAIT_KEYS: TraitKey[] = [
  "意識",
  "記憶",
  "体",
  "価値観",
  "行動",
  "時間",
  "空間",
  "次元",
  "視点",
  "存在",
  "関係",
];

export const TRAIT_DESCRIPTIONS: Record<TraitKey, string> = {
  意識: "今この瞬間の主観・自覚",
  記憶: "過去の連続性・経験の蓄積",
  体: "身体的な存在・見た目・感覚",
  価値観: "善悪・好悪・意味づけの基準",
  行動: "選択・習慣・振る舞い",
  時間: "時間軸・連続性・一回性",
  空間: "環境・世界・場所",
  次元: "現実かどうか・世界の枠組み",
  視点: "観測する側か、される側か",
  存在: "そこに在ることそのもの",
  関係: "他者との繋がり・社会的認識",
};

/**
 * Tag rubric (authored convention used throughout this file):
 *
 *   tag value = how much of that trait is PRESERVED after the scene's transformation.
 *
 *   100 = fully intact, unchanged from the real self.
 *    50 = partially preserved / partially altered.
 *     0 = completely lost or replaced.
 *
 *   Examples:
 *     「記憶40」= original memories only 40% remain.
 *     「体100」= body is physically unchanged.
 *     「意識0」= the continuous subjective stream is severed.
 *
 *   If a trait is NOT listed for a scene, it is considered irrelevant /
 *   uncommitted by the scene (no signal either way).
 */
export type Scene = {
  id: number;
  category: string;
  text: string;
  tags: Partial<Record<TraitKey, number>>;
  notes?: string[];
};

export const SCENES: Scene[] = [
  // ■記憶系
  { id: 1, category: "記憶", text: "目の前の人が大切な存在だと分かるが、名前が思い出せない。", tags: { 記憶: 40, 意識: 100, 体: 100 } },
  { id: 2, category: "記憶", text: "学生時代の記憶をすべて失っている。", tags: { 記憶: 20, 意識: 100, 体: 100 } },
  { id: 3, category: "記憶", text: "昨日の出来事だけ思い出せない。", tags: { 記憶: 80, 意識: 100, 体: 100 } },
  { id: 4, category: "記憶", text: "人生の半分の記憶を失っている。", tags: { 記憶: 10, 意識: 100, 体: 100 } },
  { id: 5, category: "記憶", text: "過去の失敗やトラウマをすべて忘れている。", tags: { 記憶: 30, 意識: 100, 体: 100 } },
  { id: 6, category: "記憶", text: "新しい記憶を一切作れない。", tags: { 記憶: 50, 意識: 100, 時間: 20 } },

  // ■体系
  { id: 7, category: "体", text: "鏡を見ると、そこには全く知らない顔が映っている。", tags: { 体: 0, 意識: 100, 記憶: 100 } },
  { id: 8, category: "体", text: "あなたの声が完全に別人のものになっている。", tags: { 体: 20, 意識: 100, 記憶: 100 } },
  { id: 9, category: "体", text: "別の性別の体になっている。", tags: { 体: 30, 意識: 100, 記憶: 100 } },
  { id: 10, category: "体", text: "体は完全に機械になっている。", tags: { 体: 0, 意識: 100, 記憶: 100, 存在: 60 } },
  { id: 11, category: "体", text: "頭だけの状態で生きている。", tags: { 体: 10, 意識: 100, 存在: 70 } },
  { id: 12, category: "体", text: "体を持たず、空間に漂う意識として存在している。", tags: { 体: 0, 存在: 40, 意識: 100 } },

  // ■意識・主観系
  { id: 13, category: "意識", text: "VRの中にいるが、それを現実だと完全に信じている。", tags: { 意識: 100, 次元: 40, 視点: 100 } },
  { id: 14, category: "意識", text: "夢の中にいるが、それを現実だと思っている。", tags: { 意識: 100, 次元: 30, 時間: 50 } },
  { id: 15, category: "意識", text: "誰かに体を操られているが、それを認識している。", tags: { 意識: 100, 行動: 20, 体: 100 } },
  { id: 16, category: "意識", text: "自分の意思で何も決められない。", tags: { 意識: 40, 行動: 0 } },

  // ■コピー・分裂系
  { id: 17, category: "コピー", text: "あなたと全く同じ記憶と性格を持つもう一人のあなたが目の前にいる。", tags: { 存在: 50, 記憶: 100, 意識: 100 } },
  { id: 18, category: "コピー", text: "そのもう一人のあなたは、あなたと同じ選択をする。", tags: { 存在: 40, 行動: 100 } },
  { id: 19, category: "コピー", text: "周囲の人はもう一人のあなたを\u201c本物\u201dだと思っている。", tags: { 存在: 20, 関係: 0 } },
  { id: 20, category: "コピー", text: "あなたの行動・発言を完全に再現するAIが存在する。", tags: { 行動: 100, 存在: 30 }, notes: ["意識不明"] },
  { id: 21, category: "コピー", text: "そのAIはあなたの代わりに生活している。", tags: { 存在: 20, 行動: 100, 関係: 30 } },

  // ■時間系
  { id: 22, category: "時間", text: "10年前の自分の体に戻っている。", tags: { 時間: 60, 記憶: 100, 体: 80 } },
  { id: 23, category: "時間", text: "未来の自分になっている。", tags: { 時間: 60, 記憶: 80, 体: 80 } },
  { id: 24, category: "時間", text: "一度死んで、生き返っている。", tags: { 存在: 60, 時間: 40, 意識: 100 } },
  { id: 25, category: "時間", text: "来世として別の人間に生まれ変わった。", tags: { 存在: 20, 記憶: 0, 体: 0 } },

  // ■空間・世界
  { id: 26, category: "空間", text: "突然、異世界に飛ばされた。", tags: { 空間: 0, 意識: 100 } },
  { id: 27, category: "空間", text: "知らない国で目を覚ました。", tags: { 空間: 20, 意識: 100 } },
  { id: 28, category: "空間", text: "全く違う歴史の世界にいる。", tags: { 時間: 20, 次元: 20 } },
  { id: 29, category: "空間", text: "平行世界にいて、少し違う人生を歩んでいる。", tags: { 次元: 40, 記憶: 80 } },

  // ■価値観・倫理
  { id: 30, category: "価値観", text: "他人の痛みに一切共感できなくなった。", tags: { 価値観: 20, 意識: 100 } },
  { id: 31, category: "価値観", text: "人を傷つけることに抵抗がない。", tags: { 価値観: 10, 行動: 40 } },
  { id: 32, category: "価値観", text: "今まで大切だったものをすべて無価値だと感じている。", tags: { 価値観: 0, 記憶: 100 } },
  { id: 33, category: "価値観", text: "お金のためなら何でもするようになった。", tags: { 価値観: 20, 行動: 60 } },

  // ■行動
  { id: 34, category: "行動", text: "今まで絶対に選ばなかった選択を自然に選ぶ。", tags: { 行動: 20, 意識: 100 } },
  { id: 35, category: "行動", text: "毎日の行動パターンが完全に変わっている。", tags: { 行動: 30, 記憶: 100 } },
  { id: 36, category: "行動", text: "好きだったものに一切興味がなくなった。", tags: { 行動: 40, 価値観: 30 } },

  // ■存在・境界
  { id: 37, category: "存在", text: "自分の体を外から見ている。", tags: { 視点: 30, 意識: 100, 体: 50 } },
  { id: 38, category: "存在", text: "自分が存在している感覚が薄れている。", tags: { 存在: 20, 意識: 60 } },
  { id: 39, category: "存在", text: "自分の意思とは関係なく世界が進んでいると感じる。", tags: { 存在: 30, 意識: 50 } },
  { id: 40, category: "存在", text: "ただの観測者として世界を見ている。", tags: { 視点: 20, 行動: 0 } },

  // ■複合（強い）
  { id: 41, category: "複合", text: "見た目は同じだが、価値観が完全に逆転している。", tags: { 体: 100, 価値観: 0 } },
  { id: 42, category: "複合", text: "記憶は同じだが、行動がすべて変わっている。", tags: { 記憶: 100, 行動: 0 } },
  { id: 43, category: "複合", text: "体は別人だが、記憶と価値観は完全に同じ。", tags: { 体: 0, 記憶: 100, 価値観: 100 } },
  { id: 44, category: "複合", text: "AIの中にアップロードされている。", tags: { 体: 0, 存在: 50 }, notes: ["意識不明"] },
  { id: 45, category: "複合", text: "体は消え、完全にデータとして存在している。", tags: { 体: 0, 存在: 30 } },

  // ■境界系
  { id: 46, category: "境界", text: "あなたの記憶・行動・価値観を完全に再現したAIが存在する。", tags: { 記憶: 100, 行動: 100, 価値観: 100 }, notes: ["意識不明"] },
  { id: 47, category: "境界", text: "そのAIは「自分があなたである」と主張している。", tags: { 存在: 50 }, notes: ["意識不明"] },
  { id: 48, category: "境界", text: "周囲の人はそのAIをあなたとして扱っている。", tags: { 関係: 0, 存在: 20 } },
  { id: 49, category: "境界", text: "あなた自身も、そのAIとの違いを説明できない。", tags: { 存在: 10 }, notes: ["意識揺らぎ"] },
  { id: 50, category: "境界", text: "「自分とは何か分からなくなっている」。", tags: { 存在: 0, 意識: 50 } },

  // ■記憶（追加）
  { id: 51, category: "記憶", text: "家族との思い出だけすべて失っている。", tags: { 記憶: 10, 意識: 100 } },
  { id: 52, category: "記憶", text: "自分の名前だけ思い出せない。", tags: { 記憶: 30, 意識: 100 } },
  { id: 53, category: "記憶", text: "他人の記憶を自分のものだと思っている。", tags: { 記憶: 20, 意識: 80 } },
  { id: 54, category: "記憶", text: "毎日すべての記憶がリセットされる。", tags: { 記憶: 0, 時間: 10 } },
  { id: 55, category: "記憶", text: "未来の記憶を持っている。", tags: { 記憶: 70, 時間: 30 } },

  // ■体（追加）
  { id: 56, category: "体", text: "透明な存在になっている。", tags: { 体: 10, 存在: 40 } },
  { id: 57, category: "体", text: "巨大な体を持っている。", tags: { 体: 20, 意識: 100 } },
  { id: 58, category: "体", text: "別の生物の体に入っている。", tags: { 体: 0, 意識: 100 } },
  { id: 59, category: "体", text: "痛みを一切感じない体になっている。", tags: { 体: 70, 意識: 100 } },
  { id: 60, category: "体", text: "老化しない体を持っている。", tags: { 体: 90, 時間: 40 } },

  // ■意識（追加）
  { id: 61, category: "意識", text: "複数の思考が同時に走っている。", tags: { 意識: 70 } },
  { id: 62, category: "意識", text: "感情を一切感じない。", tags: { 意識: 40, 価値観: 30 } },
  { id: 63, category: "意識", text: "常に誰かに見られていると感じる。", tags: { 意識: 60, 存在: 50 } },
  { id: 64, category: "意識", text: "自分の思考が他人に共有されている。", tags: { 意識: 50, 存在: 40 } },
  { id: 65, category: "意識", text: "自分の意思と無関係に考えが浮かぶ。", tags: { 意識: 40 } },

  // ■コピー・分裂（追加）
  { id: 66, category: "コピー", text: "3人に分裂している。", tags: { 存在: 30, 意識: 80 } },
  { id: 67, category: "コピー", text: "分裂したそれぞれが別の人生を歩んでいる。", tags: { 存在: 20, 時間: 40 } },
  { id: 68, category: "コピー", text: "そのうちの一人が自分だと感じる。", tags: { 存在: 40 } },
  { id: 69, category: "コピー", text: "全員が自分だと感じる。", tags: { 存在: 60 } },
  { id: 70, category: "コピー", text: "あなたのコピーがあなたより幸せに生きている。", tags: { 存在: 40 }, notes: ["感情揺らぎ"] },

  // ■時間（追加）
  { id: 71, category: "時間", text: "時間が止まった世界で動ける。", tags: { 時間: 20, 意識: 100 } },
  { id: 72, category: "時間", text: "あなただけ時間の流れが遅い。", tags: { 時間: 50, 意識: 100 } },
  { id: 73, category: "時間", text: "何度も同じ1日を繰り返している。", tags: { 時間: 10, 記憶: 100 } },
  { id: 74, category: "時間", text: "未来に飛び、過去を忘れている。", tags: { 時間: 20, 記憶: 30 } },
  { id: 75, category: "時間", text: "過去の自分を見ている。", tags: { 視点: 30, 時間: 40 } },

  // ■空間（追加）
  { id: 76, category: "空間", text: "無限に続く空間にいる。", tags: { 空間: 10, 意識: 100 } },
  { id: 77, category: "空間", text: "完全な暗闇の中にいる。", tags: { 空間: 20, 視点: 0 } },
  { id: 78, category: "空間", text: "自分しか存在しない世界にいる。", tags: { 空間: 10, 存在: 40 } },
  { id: 79, category: "空間", text: "他人のいない世界で生きている。", tags: { 関係: 0, 空間: 20 } },
  { id: 80, category: "空間", text: "世界が作り物だと知っている。", tags: { 存在: 30, 意識: 100 } },

  // ■価値観（追加）
  { id: 81, category: "価値観", text: "善悪の区別がつかない。", tags: { 価値観: 10 } },
  { id: 82, category: "価値観", text: "すべてを合理で判断する。", tags: { 価値観: 40, 意識: 100 } },
  { id: 83, category: "価値観", text: "他人を道具として扱う。", tags: { 価値観: 0, 関係: 10 } },
  { id: 84, category: "価値観", text: "何にも興味がない。", tags: { 価値観: 20, 行動: 40 } },
  { id: 85, category: "価値観", text: "すべてを愛している。", tags: { 価値観: 30 } },

  // ■行動（追加）
  { id: 86, category: "行動", text: "完全に同じ行動を毎日繰り返す。", tags: { 行動: 20 } },
  { id: 87, category: "行動", text: "他人に指示されないと動けない。", tags: { 行動: 0 } },
  { id: 88, category: "行動", text: "自動的に最適な選択をする。", tags: { 行動: 20, 意識: 60 } },
  { id: 89, category: "行動", text: "常にランダムな行動をとる。", tags: { 行動: 10 } },
  { id: 90, category: "行動", text: "意思とは関係なく体が動く。", tags: { 行動: 0, 意識: 50 } },

  // ■存在（追加）
  { id: 91, category: "存在", text: "存在しているかどうか分からない。", tags: { 存在: 10 } },
  { id: 92, category: "存在", text: "ただの情報として存在している。", tags: { 存在: 20 } },
  { id: 93, category: "存在", text: "観測されると存在する。", tags: { 存在: 30 } },
  { id: 94, category: "存在", text: "誰にも認識されていない。", tags: { 存在: 20 } },
  { id: 95, category: "存在", text: "自分の存在を疑っている。", tags: { 存在: 40 } },

  // ■複合（追加）
  { id: 96, category: "複合", text: "体は同じだが、記憶と価値観が別人。", tags: { 体: 100, 記憶: 0, 価値観: 0 } },
  { id: 97, category: "複合", text: "記憶は同じだが、意識が別。", tags: { 記憶: 100, 意識: 0 } },
  { id: 98, category: "複合", text: "意識は同じだが、行動と体が別。", tags: { 意識: 100, 行動: 0, 体: 0 } },
  { id: 99, category: "複合", text: "すべて同じだが、時間だけ違う。", tags: { 時間: 0, 記憶: 100, 体: 100, 意識: 100 } },
  { id: 100, category: "複合", text: "すべてが曖昧で、自分の定義ができない。", tags: { 存在: 0, 意識: 50 } },
];
