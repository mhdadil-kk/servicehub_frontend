function getApiErrorMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) return undefined;
  const response = (error as { response?: { data?: { message?: string } } }).response;
  const message = response?.data?.message;
  return typeof message === "string" && message.trim() ? message : undefined;
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  const apiMessage = getApiErrorMessage(error);
  if (apiMessage) return apiMessage;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}
