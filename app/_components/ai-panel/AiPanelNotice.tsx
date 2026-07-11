type Props = {
  show: boolean;
};

export function AiPanelNotice({ show }: Props) {
  if (!show) return null;
  return (
    <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
      ※ 保存済みのAI回答は再実行できません。再度利用したい場合は運営にお問い合わせください。
    </div>
  );
}
