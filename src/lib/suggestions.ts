export const MAX_SUGGESTION_LENGTH = 200;

export type SuggestionValidationError = "empty" | "too-long";

export function normalizeSuggestionMessage(message: string) {
  return message.trim();
}

export function getSuggestionValidationError(message: string): SuggestionValidationError | null {
  const normalizedMessage = normalizeSuggestionMessage(message);

  if (!normalizedMessage) {
    return "empty";
  }

  if (normalizedMessage.length > MAX_SUGGESTION_LENGTH) {
    return "too-long";
  }

  return null;
}
