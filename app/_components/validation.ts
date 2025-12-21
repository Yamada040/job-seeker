export const MAX_TEXT_LEN = 100;

export function tooLong(label: string, max: number = MAX_TEXT_LEN) {
  return `${label}は${max}文字以内で入力してください`;
}
