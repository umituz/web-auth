export function authErrorMessage(
  err: unknown,
  fallbackKey: string,
  statusKeys: Record<number, string> = {},
): string {
  const status = (err as { status?: number } | null)?.status;
  if (typeof status === "number") return statusKeys[status] ?? fallbackKey;
  return err instanceof Error && err.message ? err.message : fallbackKey;
}
