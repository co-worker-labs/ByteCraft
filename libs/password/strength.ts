import { mapWarning, mapSuggestions } from "./warnings-map";

export type StrengthScore = 0 | 1 | 2 | 3 | 4;

export type CrackTimeUnit =
  | "instant"
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "months"
  | "years"
  | "centuries";

export interface StrengthResult {
  score: StrengthScore;
  crackTimeSeconds: number;
  crackTimeUnit: CrackTimeUnit;
  crackTimeValue: number;
  warningKey: string | null;
  suggestionKeys: string[];
}

const SECOND = 1;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const MONTH = DAY * 31;
const YEAR = MONTH * 12;

const TIME_UNITS: { unit: CrackTimeUnit; seconds: number }[] = [
  { unit: "seconds", seconds: SECOND },
  { unit: "minutes", seconds: MINUTE },
  { unit: "hours", seconds: HOUR },
  { unit: "days", seconds: DAY },
  { unit: "months", seconds: MONTH },
  { unit: "years", seconds: YEAR },
  { unit: "centuries", seconds: YEAR * 100 },
];

function computeCrackTimeUnit(totalSeconds: number): {
  unit: CrackTimeUnit;
  value: number;
} {
  if (totalSeconds < SECOND) {
    return { unit: "instant", value: 0 };
  }
  for (let i = 0; i < TIME_UNITS.length; i++) {
    const nextSeconds = i + 1 < TIME_UNITS.length ? TIME_UNITS[i + 1].seconds : Infinity;
    if (totalSeconds < nextSeconds) {
      return {
        unit: TIME_UNITS[i].unit,
        value: Math.round(totalSeconds / TIME_UNITS[i].seconds),
      };
    }
  }
  return { unit: "centuries", value: Math.round(totalSeconds / (YEAR * 100)) };
}

let initialized = false;

async function ensureInitialized() {
  if (initialized) return;
  const [{ zxcvbnOptions }, { dictionary: commonDict }, { dictionary: enDict }] = await Promise.all(
    [
      import("@zxcvbn-ts/core"),
      import("@zxcvbn-ts/language-common"),
      import("@zxcvbn-ts/language-en"),
    ]
  );
  zxcvbnOptions.setOptions({
    dictionary: { ...commonDict, ...enDict },
  });
  initialized = true;
}

export async function analyzeStrength(password: string): Promise<StrengthResult> {
  await ensureInitialized();
  const { zxcvbnAsync } = await import("@zxcvbn-ts/core");
  const result = await zxcvbnAsync(password);

  const crackSeconds = result.crackTimesSeconds.offlineSlowHashing1e4PerSecond;
  const { unit, value } = computeCrackTimeUnit(crackSeconds);

  return {
    score: result.score as StrengthScore,
    crackTimeSeconds: crackSeconds,
    crackTimeUnit: unit,
    crackTimeValue: value,
    warningKey: mapWarning(result.feedback.warning ?? null),
    suggestionKeys: mapSuggestions(result.feedback.suggestions.filter(Boolean)),
  };
}
