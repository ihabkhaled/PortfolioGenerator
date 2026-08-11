export function extractExplicitIdentityValue(text: string, label: string): string | null {
  const prefix = `${label.toLowerCase()}:`;
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.toLowerCase().startsWith(prefix)) continue;
    const value = trimmed.slice(prefix.length).trim();
    return value === '' ? null : value;
  }
  return null;
}
