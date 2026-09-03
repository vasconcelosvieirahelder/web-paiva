"use client";

import { useFormStatus } from "react-dom";
import type { Locale } from "@/i18n/config";
import type { ModerationAction } from "@/lib/moderation";
import { getModerationButtonClassName, getModerationButtonLabel } from "@/lib/moderation-button-feedback";

type ModerationFormProps = {
  action: ModerationAction;
  formAction: (formData: FormData) => void | Promise<void>;
  label: string;
  locale: Locale;
  listingId: string;
};

function ModerationSubmitButton({ action, label }: Pick<ModerationFormProps, "action" | "label">) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-busy={pending}
      className={getModerationButtonClassName(action)}
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      <span>{getModerationButtonLabel(action, label, pending)}</span>
    </button>
  );
}

export function ModerationForm({ action, formAction, label, locale, listingId }: ModerationFormProps) {
  return (
    <form action={formAction} className="grid gap-2">
      <input name="locale" type="hidden" value={locale} />
      <input name="listingId" type="hidden" value={listingId} />
      <input name="action" type="hidden" value={action} />
      {action === "reject" ? (
        <textarea
          className="min-h-20 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
          maxLength={500}
          name="reason"
          placeholder="Motivo da recusa, opcional"
        />
      ) : null}
      <ModerationSubmitButton action={action} label={label} />
    </form>
  );
}
