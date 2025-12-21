export const MAX_TEXT_LEN = 100;

export const COMPANY_FIELDS = [
  { name: "name", label: "企業名" },
  { name: "industry", label: "業界" },
  { name: "url", label: "企業サイトURL" },
  { name: "mypage_id", label: "マイページID" },
  { name: "mypage_url", label: "マイページURL" },
  { name: "stage", label: "選考状況" },
] as const;

export const PROFILE_FIELDS = [
  { name: "full_name", label: "氏名" },
  { name: "university", label: "大学" },
  { name: "faculty", label: "学部/学科" },
  { name: "avatar_id", label: "アバター" },
  { name: "target_industry", label: "志望業界" },
  { name: "career_axis", label: "就活の軸" },
  { name: "goal_state", label: "就活で達成したい状態" },
] as const;

export const ES_NEW_FIELDS = [
  { name: "company_name", label: "企業名" },
  { name: "title", label: "タイトル" },
  { name: "selection_status", label: "職種/募集枠" },
  { name: "company_url", label: "企業URL" },
  { name: "memo", label: "メモ" },
] as const;

export const WEBTEST_NEW_FIELDS = [
  { name: "title", label: "タイトル" },
  { name: "category", label: "カテゴリ" },
  { name: "test_type", label: "テスト形式" },
  { name: "format", label: "出題形式" },
  { name: "difficulty", label: "難易度" },
  { name: "answer", label: "正解" },
] as const;
