"use client";

import Image from "next/image";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useId, useState } from "react";

type FileUploadFieldProps = {
  description: string;
  label: string;
  name: string;
};

const maxFileSizeInMb = 5;
const maxFileSizeInBytes = maxFileSizeInMb * 1024 * 1024;

function formatFileSize(sizeInBytes: number) {
  return `${(sizeInBytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileUploadField({ description, label, name }: FileUploadFieldProps) {
  const inputId = useId();
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function clearSelectedFile(input: HTMLInputElement) {
    input.value = "";
    setFileName("");
    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }

      return "";
    });
  }

  function validateSelectedFile(input: HTMLInputElement, shouldShowPreview: boolean) {
    const file = input.files?.[0] ?? null;
    setError("");

    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }

      return "";
    });

    if (!file) {
      setFileName("");
      return false;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      clearSelectedFile(input);
      setError("Use uma imagem JPG, PNG ou WEBP.");
      return false;
    }

    if (file.size > maxFileSizeInBytes) {
      clearSelectedFile(input);
      setError(
        `Este arquivo tem ${formatFileSize(file.size)}. O limite permitido é ${maxFileSizeInMb} MB. Escolha uma imagem menor.`,
      );
      return false;
    }

    setFileName(file.name);

    if (shouldShowPreview) {
      setPreviewUrl(URL.createObjectURL(file));
    }

    return true;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    validateSelectedFile(event.currentTarget, true);
  }

  function handleInput(event: FormEvent<HTMLInputElement>) {
    validateSelectedFile(event.currentTarget, true);
  }

  return (
    <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <div>
        <label className="text-sm font-semibold text-slate-900" htmlFor={inputId}>
          {label}
        </label>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>

      <div className="grid gap-3">
        <input
          accept="image/png,image/jpeg,image/webp"
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:border-teal-700"
          id={inputId}
          name={name}
          onChange={handleChange}
          onInput={handleInput}
          type="file"
        />
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <p className={fileName ? "text-sm font-medium text-slate-950" : "text-sm text-slate-500"}>
            {fileName ? `Selecionado e pronto para envio: ${fileName}` : "Nenhum arquivo selecionado"}
          </p>
        </div>
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      {fileName && !error ? (
        <p className="text-sm font-medium text-teal-800">
          O upload será concluído ao enviar o cadastro para aprovação.
        </p>
      ) : null}

      {previewUrl ? (
        <div className="relative h-36 w-full overflow-hidden rounded-md border border-slate-200 bg-white sm:w-52">
          <Image alt={`Prévia de ${label}`} className="object-contain" fill src={previewUrl} unoptimized />
        </div>
      ) : null}
    </div>
  );
}
