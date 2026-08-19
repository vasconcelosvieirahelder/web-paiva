import Link from "next/link";
import type { Locale } from "@/i18n/config";

const footerText: Record<Locale, { contact: string; producedBy: string; suggestions: string }> = {
  "pt-BR": {
    producedBy: "Portal produzido por",
    contact: "Contato",
    suggestions: "Sugestões",
  },
  en: {
    producedBy: "Portal produced by",
    contact: "Contact",
    suggestions: "Suggestions",
  },
  es: {
    producedBy: "Portal producido por",
    contact: "Contacto",
    suggestions: "Sugerencias",
  },
  ru: {
    producedBy: "Портал создан",
    contact: "Контакт",
    suggestions: "Предложения",
  },
  "zh-CN": {
    producedBy: "门户制作方",
    contact: "联系方式",
    suggestions: "建议",
  },
};

type SiteFooterProps = {
  locale: Locale;
};

export function SiteFooter({ locale }: SiteFooterProps) {
  const text = footerText[locale];

  return (
    <footer className="border-t border-white/10 bg-[#082f2f]/92 text-teal-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          {text.producedBy}{" "}
          <a
            className="font-semibold text-white underline-offset-4 hover:underline"
            href="mailto:contato@wavecreators.example?subject=Contato%20via%20Web%20Paiva"
          >
            Wave Creators
          </a>
        </p>
        <div className="flex flex-col gap-1 text-teal-100 sm:items-end">
          <Link
            className="mb-2 inline-flex w-fit rounded-md border border-white/20 px-3 py-2 font-medium text-white transition hover:border-white/40 hover:bg-white/10"
            href={`/${locale}/suggestions`}
          >
            {text.suggestions}
          </Link>
          <p>{text.contact}</p>
          <a className="hover:text-white" href="mailto:contato@wavecreators.example">
            contato@wavecreators.example
          </a>
          <a className="hover:text-white" href="tel:+5581999990000">
            +55 81 99999-0000
          </a>
        </div>
      </div>
    </footer>
  );
}
