/** Stable production tokens used by the solver's API and tutor/grader boundary. */
export const Technique = {
  UnitCompletion: 'UnitCompletion',
  HiddenSingles: 'HiddenSingles',
  NakedSingles: 'NakedSingles',
  NakedPairs: 'NakedPairs',
  XWing: 'XWing',
} as const;

export type TechniqueName = (typeof Technique)[keyof typeof Technique];
