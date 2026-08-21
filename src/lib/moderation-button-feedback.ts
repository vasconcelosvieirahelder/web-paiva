import type { ModerationAction } from "./moderation";

const pendingLabels: Record<ModerationAction, string> = {
  approve: "Aprovando...",
  reject: "Recusando...",
  suspend: "Suspendendo...",
};

const baseClassName =
  "relative inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70";

const moderationActionClassNames: Record<ModerationAction, string> = {
  approve:
    "bg-teal-700 text-white shadow-sm hover:bg-teal-800 active:scale-[0.98] active:bg-teal-900 focus-visible:ring-teal-600 disabled:hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500",
  reject:
    "border border-red-300 bg-red-50 text-red-800 shadow-sm hover:border-red-500 hover:bg-red-100 hover:text-red-900 active:scale-[0.98] active:bg-red-200 focus-visible:ring-red-500 disabled:hover:border-red-300 disabled:hover:bg-red-50 dark:border-red-400/50 dark:bg-red-950/40 dark:text-red-100 dark:hover:bg-red-900/60",
  suspend:
    "border border-amber-300 bg-amber-50 text-amber-900 shadow-sm hover:border-amber-500 hover:bg-amber-100 hover:text-amber-950 active:scale-[0.98] active:bg-amber-200 focus-visible:ring-amber-500 disabled:hover:border-amber-300 disabled:hover:bg-amber-50 dark:border-amber-400/50 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/60",
};

export function getModerationButtonLabel(action: ModerationAction, label: string, isPending: boolean) {
  if (isPending) {
    return pendingLabels[action];
  }

  return label;
}

export function shouldHighlightModerationAction(action: ModerationAction) {
  return action === "reject" || action === "suspend";
}

export function getModerationButtonClassName(action: ModerationAction) {
  return `moderation-button-${action} ${baseClassName} ${moderationActionClassNames[action]}`;
}
