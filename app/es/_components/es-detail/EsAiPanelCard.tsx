import { EsAiPanel } from "../ai-es-panel";
import { Entry } from "./types";

type Props = {
  entry: Entry;
  combinedContent: string;
};

export function EsAiPanelCard({ entry, combinedContent }: Props) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
      <EsAiPanel
        content={combinedContent}
        cacheKey={`es-${entry.id}`}
        initialSummary={entry.ai_summary}
        saveUrl="/api/ai/es"
        saveId={entry.id}
        defaultCompanyName={entry.company_name}
        defaultStatus={entry.status ?? undefined}
        defaultCompanyUrl={entry.company_url}
        defaultTitle={entry.title}
      />
    </div>
  );
}
