import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export const features = [
  {
    icon: PencilSquareIcon,
    title: "AI ES添削",
    description: "GPT・Geminiによる高品質な添削で、通過率の高いエントリーシートを作成",
    benefit: "添削時間を80%短縮",
  },
  {
    icon: BuildingOffice2Icon,
    title: "企業管理",
    description: "選考状況、志望度、メモを一元管理。進捗を見える化して効率的に就活",
    benefit: "管理工数を50%削減",
  },
  {
    icon: ChartBarIcon,
    title: "進捗可視化",
    description: "ゲーム感覚でタスクをこなし、XPとレベルで成長を実感できる仕組み",
    benefit: "継続率を3倍向上",
  },
];

export const steps = [
  {
    step: "01",
    title: "アカウント作成",
    description: "メールアドレスだけで簡単登録。30秒で始められます。",
  },
  {
    step: "02",
    title: "企業・ES登録",
    description: "志望企業とエントリーシートを登録して管理開始。",
  },
  {
    step: "03",
    title: "AI活用で効率化",
    description: "添削機能で質を向上、進捗管理で確実に内定獲得へ。",
  },
];

export const stats = [
  { value: "80%", label: "添削時間短縮" },
  { value: "3倍", label: "継続率向上" },
  { value: "50%", label: "管理工数削減" },
  { value: "100+", label: "活用中の学生" },
];

export const badges = [
  { icon: SparklesIcon, label: "AI活用", className: "border-amber-200/80 bg-amber-50/80" },
  { icon: CheckCircleIcon, label: "無料で始められる", className: "border-emerald-200/80 bg-emerald-50/80 text-emerald-700" },
];

export { ArrowRightIcon, CheckCircleIcon };
