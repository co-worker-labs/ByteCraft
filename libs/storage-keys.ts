export const STORAGE_KEYS = {
  savedPasswords: "okrun:sp",
  diff: "okrun:diff",
  markdown: "okrun:md",
  dbviewerHistory: "okrun:dbviewer:history",
  cron: "okrun:cron",
  qrcode: "okrun:qrcode",
  color: "okrun:color:history",
  floatingToolbarPosition: "okrun:ftp",
  recentTools: "okrun:recent-tools",
  homeViewMode: "okrun:home-view",
  sshkeyDeployTarget: "okrun:sshkey:deploy",
  httpclientHistory: "okrun:httpclient:history",
  walletSelectedChains: "okrun:wallet:chains",
  onboardingClearClipboard: "okrun:onboarding:clear-clipboard",
  recipeList: "okrun:recipe:list",
  recipeDraft: "okrun:recipe:draft",
} as const;

export const COOKIE_KEYS = {
  theme: "okrun:th",
} as const;
