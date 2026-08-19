import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Web Paiva",
  description: "Plataforma local de divulgação da Reserva do Paiva.",
};

const themeScript = `
try {
  var themeStorageKey = "web-paiva-theme-choice";
  var legacyThemeStorageKey = "web-paiva-theme";
  var validThemes = { light: true, dark: true };

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }

  var savedTheme = window.localStorage.getItem(themeStorageKey);
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = validThemes[savedTheme] ? savedTheme : prefersDark ? "dark" : "light";

  window.localStorage.removeItem(legacyThemeStorageKey);
  applyTheme(theme);

  document.addEventListener("click", function (event) {
    var target = event.target && event.target.closest ? event.target.closest("[data-theme-select]") : null;

    if (!target) {
      return;
    }

    var nextTheme = target.getAttribute("data-theme-select");

    if (!validThemes[nextTheme]) {
      return;
    }

    window.localStorage.setItem(themeStorageKey, nextTheme);
    window.localStorage.removeItem(legacyThemeStorageKey);
    applyTheme(nextTheme);
  });
} catch (_) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
