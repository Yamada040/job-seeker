export const XP_PER_LEVEL = 25;

export function computeLevel(xp: number) {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

export function getLevelThresholds(level: number) {
  return {
    prevThreshold: Math.max(0, (level - 1) * XP_PER_LEVEL),
    nextThreshold: level * XP_PER_LEVEL,
  };
}
