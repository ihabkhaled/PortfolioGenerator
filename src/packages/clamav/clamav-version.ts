export function parseClamAvSignatureDate(response: string): Date | null {
  const dateText = response.trim().split('/', 3)[2];
  if (dateText === undefined) return null;
  const timestamp = Date.parse(`${dateText} GMT`);
  return Number.isFinite(timestamp) ? new Date(timestamp) : null;
}

export function signatureDatabaseIsFresh(
  signatureDate: Date | null,
  now: Date,
  maxAgeHours: number,
): boolean {
  if (signatureDate === null || signatureDate.getTime() > now.getTime()) return false;
  return now.getTime() - signatureDate.getTime() <= maxAgeHours * 3_600_000;
}
