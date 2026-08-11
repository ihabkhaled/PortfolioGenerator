/** Returns a compact, Unicode-safe account initial without inventing a name. */
export function accountInitial(name: string, email: string): string {
  const source = name.trim() || email.trim();
  const segment = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    .segment(source)
    [Symbol.iterator]()
    .next().value?.segment;
  return segment?.toLocaleUpperCase() ?? '?';
}
