// SPARK 레벨 등급 기준 (Lv.1~100, 5단계)
export const LEVEL_TIERS = [
  { min: 1, max: 19, label: '비기너' },
  { min: 20, max: 39, label: '챌린저' },
  { min: 40, max: 69, label: '러너' },
  { min: 70, max: 89, label: '마스터' },
  { min: 90, max: 100, label: '스파크' },
] as const

export const DEFAULT_TRUST_SCORE = 70

export function getLevelTier(levelNumber: number) {
  return LEVEL_TIERS.find(t => levelNumber >= t.min && levelNumber <= t.max)?.label ?? LEVEL_TIERS[0].label
}

// DB에는 아직 숫자 레벨/XP 컬럼이 없어, exercise_level(beginner~expert) 기준으로
// 등급 구간 안의 대표 숫자를 매핑해 보여준다.
export function levelNumberFromExerciseLevel(exerciseLevel?: string | null) {
  switch (exerciseLevel) {
    case 'expert': return 80
    case 'advanced': return 55
    case 'intermediate': return 28
    default: return 8
  }
}

export function levelBadgeText(levelNumber: number) {
  return `${getLevelTier(levelNumber)} · LV.${levelNumber}`
}

// 번개 참여조건/운동 레벨 조건에 쓰는 운동 실력 등급(LEVEL_ORDER: beginner~expert)의 한글 표기.
export const EXERCISE_LEVEL_LABEL: Record<string, string> = {
  beginner: '초보자',
  intermediate: '중급자',
  advanced: '고급자',
  expert: '전문가',
}

export function exerciseLevelLabel(level?: string | null) {
  return (level && EXERCISE_LEVEL_LABEL[level]) ?? '초보자'
}
