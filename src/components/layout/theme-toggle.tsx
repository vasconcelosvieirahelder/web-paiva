"use client";

function SunIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M20.2 14.3A7.6 7.6 0 0 1 9.7 3.8 8.6 8.6 0 1 0 20.2 14.3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function ThemeToggle() {
  return (
    <div
      aria-label="Selecionar tema"
      className="inline-flex h-10 items-center gap-1 rounded-md border border-teal-900/15 bg-white p-1 text-teal-900 shadow-sm"
      role="group"
    >
      <button
        aria-label="Usar tema claro"
        className="theme-choice theme-choice-light flex h-8 w-8 items-center justify-center rounded text-slate-500 transition hover:bg-teal-50"
        data-theme-select="light"
        title="Tema claro"
        type="button"
      >
        <SunIcon />
      </button>
      <button
        aria-label="Usar tema escuro"
        className="theme-choice theme-choice-dark flex h-8 w-8 items-center justify-center rounded text-slate-500 transition hover:bg-teal-50"
        data-theme-select="dark"
        title="Tema escuro"
        type="button"
      >
        <MoonIcon />
      </button>
    </div>
  );
}
