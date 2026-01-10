export type Question = { id: string; prompt: string; answer_md: string };

export type Entry = {
  id: string;
  company_name: string | null;
  selection_status: string | null;
  company_url: string | null;
  memo: string | null;
  deadline: string | null;
  title: string | null;
  status: string | null;
  content_md: string | null;
  ai_summary: string | null;
  tags: string[] | null;
};
