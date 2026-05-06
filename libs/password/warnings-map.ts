export const warningMap: Record<string, string> = {
  straightRow: "zxcvbnWarningStraightRow",
  keyPattern: "zxcvbnWarningKeyPattern",
  simpleRepeat: "zxcvbnWarningSimpleRepeat",
  extendedRepeat: "zxcvbnWarningExtendedRepeat",
  sequences: "zxcvbnWarningSequences",
  recentYears: "zxcvbnWarningRecentYears",
  dates: "zxcvbnWarningDates",
  topTen: "zxcvbnWarningTopTen",
  topHundred: "zxcvbnWarningTopHundred",
  common: "zxcvbnWarningCommon",
  similarToCommon: "zxcvbnWarningSimilarToCommon",
  wordByItself: "zxcvbnWarningWordByItself",
  namesByThemselves: "zxcvbnWarningNamesByThemselves",
  commonNames: "zxcvbnWarningCommonNames",
  userInputs: "zxcvbnWarningUserInputs",
  pwned: "zxcvbnWarningPwned",
};

export const suggestionMap: Record<string, string> = {
  l33t: "zxcvbnSuggestionL33t",
  reverseWords: "zxcvbnSuggestionReverseWords",
  allUppercase: "zxcvbnSuggestionAllUppercase",
  capitalization: "zxcvbnSuggestionCapitalization",
  dates: "zxcvbnSuggestionDates",
  recentYears: "zxcvbnSuggestionRecentYears",
  associatedYears: "zxcvbnSuggestionAssociatedYears",
  sequences: "zxcvbnSuggestionSequences",
  repeated: "zxcvbnSuggestionRepeated",
  longerKeyboardPattern: "zxcvbnSuggestionLongerKeyboardPattern",
  anotherWord: "zxcvbnSuggestionAnotherWord",
  useWords: "zxcvbnSuggestionUseWords",
  noNeed: "zxcvbnSuggestionNoNeed",
  pwned: "zxcvbnSuggestionPwned",
};

export function mapWarning(key: string | null): string | null {
  if (!key) return null;
  return warningMap[key] ?? key;
}

export function mapSuggestions(keys: string[]): string[] {
  return keys.map((key) => suggestionMap[key] ?? key);
}
