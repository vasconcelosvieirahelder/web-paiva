export const themes = ["light", "dark"] as const;

export type Theme = (typeof themes)[number];

export function getSafeTheme(value: string | null | undefined): Theme {
  return value === "dark" ? "dark" : "light";
}

export function getInitialTheme(savedTheme: string | null | undefined, prefersDark: boolean): Theme {
  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return prefersDark ? "dark" : "light";
}

export function getNextTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}
