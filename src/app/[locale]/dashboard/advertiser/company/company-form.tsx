"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileUploadField } from "@/components/ui/file-upload-field";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n/config";
import { getSpellCheckLanguage } from "@/i18n/text-input";
import { getLocalizedCategoryName } from "@/lib/listings";
import { submitCompanyRegistration } from "./actions";

type Category = {
  id: string;
  slug: string;
  name_pt_br: string;
  name_en: string;
  name_es: string;
  name_ru: string;
  name_zh_cn: string;
};

type CompanyFormProps = {
  categories: Category[];
  locale: Locale;
};

type FieldProps = {
  children: ReactNode;
  help?: string;
  label: string;
  required?: boolean;
};

const textareaClassName =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20";

function Field({ children, help, label, required = false }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800">
      <span>
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : <span className="ml-1 font-normal text-slate-500">(opcional)</span>}
      </span>
      {children}
      {help ? <span className="text-xs font-normal leading-5 text-slate-500">{help}</span> : null}
    </label>
  );
}

function digitsOnly(event: FormEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  input.value = input.value.replace(/\D/g, "");
}

function getStoredFormKey(locale: Locale) {
  return `web-paiva-company-form-${locale}`;
}

export function CompanyForm({ categories, locale }: CompanyFormProps) {
  const spellCheckLanguage = getSpellCheckLanguage(locale);
  const formRef = useRef<HTMLFormElement>(null);
  const isRestoringRef = useRef(false);
  const storageKey = useMemo(() => getStoredFormKey(locale), [locale]);

  useEffect(() => {
    function restoreDraft() {
      const form = formRef.current;

      if (!form) {
        return;
      }

      try {
        const storedValues = window.localStorage.getItem(storageKey);

        if (!storedValues) {
          return;
        }

        const values = JSON.parse(storedValues) as Record<string, string>;
        const fields = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
          "input[name], textarea[name], select[name]",
        );

        isRestoringRef.current = true;

        fields.forEach((field) => {
          if (field.type === "file" || field.type === "hidden") {
            return;
          }

          const value = values[field.name];

          if (typeof value === "string") {
            field.value = value;
          }
        });

        window.setTimeout(() => {
          isRestoringRef.current = false;
        }, 0);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }

    restoreDraft();

    const restoreAfterHydration = window.setTimeout(restoreDraft, 150);
    const restoreAfterBrowserAutofill = window.setTimeout(restoreDraft, 600);

    window.addEventListener("pageshow", restoreDraft);

    return () => {
      window.clearTimeout(restoreAfterHydration);
      window.clearTimeout(restoreAfterBrowserAutofill);
      window.removeEventListener("pageshow", restoreDraft);
    };
  }, [storageKey]);

  function saveDraft() {
    if (isRestoringRef.current) {
      return;
    }

    const form = formRef.current;

    if (!form) {
      return;
    }

    const values: Record<string, string> = {};
    const fields = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      "input[name], textarea[name], select[name]",
    );

    fields.forEach((field) => {
      if (field.type === "file" || field.type === "hidden") {
        return;
      }

      values[field.name] = field.value;
    });

    window.localStorage.setItem(storageKey, JSON.stringify(values));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;

    saveDraft();

    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
    }
  }

  return (
    <form action={submitCompanyRegistration} className="grid gap-5" onChange={saveDraft} onInput={saveDraft} onSubmit={handleSubmit} ref={formRef}>
      <input name="locale" type="hidden" value={locale} />

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Dados da empresa</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Informe como o serviço, produto ou comércio deve ser avaliado pela moderação.
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500">Campos com * são obrigatórios.</p>
        </div>
        <Field label="Nome da empresa ou prestador" required>
          <Input lang={spellCheckLanguage} minLength={2} name="businessName" required />
        </Field>
        <Field label="Título do anúncio" required>
          <Input lang={spellCheckLanguage} minLength={4} name="listingTitle" required />
        </Field>
        <Field label="Categoria" required>
          <select
            className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
            name="categoryId"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {getLocalizedCategoryName(category, locale, "Categoria")}
              </option>
            ))}
          </select>
        </Field>
        <Field help="Mínimo de 20 caracteres." label="Descrição do serviço, produto ou atendimento" required>
          <textarea
            className={`min-h-32 ${textareaClassName}`}
            lang={spellCheckLanguage}
            maxLength={1200}
            minLength={20}
            name="description"
            required
            spellCheck
          />
        </Field>
        <Field label="Preço ou condição">
          <Input lang={spellCheckLanguage} maxLength={80} name="priceLabel" placeholder="Ex.: a combinar" />
        </Field>
      </section>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Contatos públicos</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Estes contatos poderão aparecer no anúncio depois da aprovação. Todos são opcionais.
          </p>
        </div>
        <Field help="Digite apenas números, com DDD." label="WhatsApp comercial">
          <Input inputMode="numeric" lang={spellCheckLanguage} maxLength={15} name="whatsapp" onInput={digitsOnly} pattern="[0-9]{8,15}" type="tel" />
        </Field>
        <Field help="Digite apenas números, com DDD." label="Telefone comercial">
          <Input inputMode="numeric" lang={spellCheckLanguage} maxLength={15} name="phone" onInput={digitsOnly} pattern="[0-9]{8,15}" type="tel" />
        </Field>
        <Field label="E-mail comercial">
          <Input lang={spellCheckLanguage} name="email" type="email" />
        </Field>
        <Field label="Site ou Instagram">
          <Input
            lang={spellCheckLanguage}
            maxLength={250}
            name="websiteUrl"
            placeholder="https://... ou @usuario_instagram"
            type="text"
          />
        </Field>
      </section>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Evidências para moderação</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            As imagens e a referência não serão exibidas publicamente. Elas servem apenas para validação manual.
          </p>
        </div>
        <FileUploadField
          description="Envie a marca que identifica a empresa ou o prestador. Use JPG, PNG ou WEBP, com até 5 MB."
          label="Logomarca da empresa"
          name="logo"
        />
        <FileUploadField
          description="Envie uma imagem da empresa operando, vendendo ou prestando serviço no Paiva. Use JPG, PNG ou WEBP, com até 5 MB."
          label="Foto da empresa prestando serviço no Paiva"
          name="operationPhoto"
        />
        <Field label="Nome da referência">
          <Input lang={spellCheckLanguage} maxLength={120} name="referenceName" />
        </Field>
        <Field help="Digite apenas números, com DDD." label="Telefone de referência dentro da Reserva do Paiva" required>
          <Input
            inputMode="numeric"
            lang={spellCheckLanguage}
            maxLength={15}
            minLength={8}
            name="referencePhone"
            onInput={digitsOnly}
            pattern="[0-9]{8,15}"
            required
            type="tel"
          />
        </Field>
        <Field label="Observação sobre o atendimento realizado">
          <textarea
            className={`min-h-24 ${textareaClassName}`}
            lang={spellCheckLanguage}
            maxLength={500}
            name="referenceNotes"
            spellCheck
          />
        </Field>
      </section>

      <Button type="submit">Enviar para aprovação</Button>
    </form>
  );
}
