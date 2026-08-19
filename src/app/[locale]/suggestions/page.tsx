import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { MAX_SUGGESTION_LENGTH } from "@/lib/suggestions";
import { createClient } from "@/lib/supabase/server";
import { submitSuggestionAction } from "./actions";

type SuggestionsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; status?: string }>;
};

const suggestionPageText: Record<
  Locale,
  {
    back: string;
    description: string;
    empty: string;
    label: string;
    save: string;
    sent: string;
    title: string;
    tooLong: string;
    helper: string;
    saveError: string;
  }
> = {
  "pt-BR": {
    back: "Voltar para a página inicial",
    description: "Envie uma sugestão curta para melhorar o Web Paiva. A mensagem será vista apenas pela administração.",
    empty: "Escreva uma sugestão antes de enviar.",
    helper: "Até 200 caracteres.",
    label: "Sua sugestão",
    save: "Enviar sugestão",
    saveError: "Não foi possível enviar agora. Tente novamente em alguns instantes.",
    sent: "Sugestão enviada. Obrigado por ajudar o Web Paiva a melhorar.",
    title: "Sugestões",
    tooLong: "A sugestão precisa ter no máximo 200 caracteres.",
  },
  en: {
    back: "Back to home",
    description: "Send a short suggestion to improve Web Paiva. Only admins can read it.",
    empty: "Write a suggestion before sending.",
    helper: "Up to 200 characters.",
    label: "Your suggestion",
    save: "Send suggestion",
    saveError: "We could not send it now. Please try again soon.",
    sent: "Suggestion sent. Thank you for helping improve Web Paiva.",
    title: "Suggestions",
    tooLong: "The suggestion must be 200 characters or less.",
  },
  es: {
    back: "Volver al inicio",
    description: "Envíe una sugerencia breve para mejorar Web Paiva. Solo la administración podrá verla.",
    empty: "Escriba una sugerencia antes de enviarla.",
    helper: "Hasta 200 caracteres.",
    label: "Su sugerencia",
    save: "Enviar sugerencia",
    saveError: "No fue posible enviarla ahora. Inténtelo nuevamente en unos instantes.",
    sent: "Sugerencia enviada. Gracias por ayudar a mejorar Web Paiva.",
    title: "Sugerencias",
    tooLong: "La sugerencia debe tener como máximo 200 caracteres.",
  },
  ru: {
    back: "Вернуться на главную",
    description: "Отправьте короткое предложение по улучшению Web Paiva. Его увидит только администрация.",
    empty: "Напишите предложение перед отправкой.",
    helper: "До 200 символов.",
    label: "Ваше предложение",
    save: "Отправить предложение",
    saveError: "Не удалось отправить сейчас. Попробуйте еще раз чуть позже.",
    sent: "Предложение отправлено. Спасибо за помощь в улучшении Web Paiva.",
    title: "Предложения",
    tooLong: "Предложение должно быть не длиннее 200 символов.",
  },
  "zh-CN": {
    back: "返回首页",
    description: "发送一条简短建议，帮助改进 Web Paiva。只有管理员可以查看。",
    empty: "请先填写建议。",
    helper: "最多 200 个字符。",
    label: "您的建议",
    save: "发送建议",
    saveError: "现在无法发送。请稍后重试。",
    sent: "建议已发送。感谢您帮助 Web Paiva 改进。",
    title: "建议",
    tooLong: "建议最多 200 个字符。",
  },
};

function getErrorMessage(error: string | undefined, text: (typeof suggestionPageText)[Locale]) {
  if (error === "empty") {
    return text.empty;
  }

  if (error === "too-long") {
    return text.tooLong;
  }

  if (error === "save") {
    return text.saveError;
  }

  return null;
}

export default async function SuggestionsPage({ params, searchParams }: SuggestionsPageProps) {
  const { locale } = await params;
  const { error, status } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale);
  const text = suggestionPageText[locale];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/suggestions`)}`);
  }

  const errorMessage = getErrorMessage(error, text);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader isAuthenticated locale={locale} messages={messages} />
      <main className="mx-auto grid max-w-2xl gap-6 px-4 py-10">
        <Link className="text-sm font-medium text-teal-700 hover:text-teal-800" href={`/${locale}`}>
          {text.back}
        </Link>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold">{text.title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">{text.description}</p>

          {status === "sent" ? (
            <div className="mt-5 rounded-md border border-teal-100 bg-teal-50 p-4 text-sm font-medium text-teal-900">
              {text.sent}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <form action={submitSuggestionAction} className="mt-6 grid gap-4">
            <input name="locale" type="hidden" value={locale} />
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              {text.label}
              <textarea
                className="min-h-32 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                lang={locale}
                maxLength={MAX_SUGGESTION_LENGTH}
                name="message"
                required
                spellCheck
              />
            </label>
            <p className="text-xs text-slate-500">{text.helper}</p>
            <Button type="submit">{text.save}</Button>
          </form>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
