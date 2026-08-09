export function extractRtfText(bytes: Uint8Array): string {
  const escapedOpenBrace = '\u{E000}';
  const escapedCloseBrace = '\u{E001}';
  const source = new TextDecoder('latin1').decode(bytes);
  const decoded = source
    .replaceAll(/\\'([\da-f]{2})/giu, (_match, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replaceAll(/\\u(-?\d+)\??/gu, (_match, value: string) =>
      String.fromCodePoint((Number(value) + 65_536) % 65_536),
    )
    .replaceAll(/\\(?:par|line|page)\b\s?/gu, '\n')
    .replaceAll(/\\tab\b\s?/gu, '\t')
    .replaceAll(/\\[{}\\]/gu, (value) => {
      if (value === '\\{') return escapedOpenBrace;
      if (value === '\\}') return escapedCloseBrace;
      return value.slice(1);
    });

  return stripRtfControlWords(decoded)
    .replaceAll(/[{}]/gu, '')
    .replaceAll(escapedOpenBrace, '{')
    .replaceAll(escapedCloseBrace, '}')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

export function stripRtfControlWords(source: string): string {
  let output = '';
  let index = 0;

  while (index < source.length) {
    if (source[index] !== '\\' || !/[a-z]/iu.test(source[index + 1] ?? '')) {
      output += source[index] ?? '';
      index += 1;
      continue;
    }

    index += 1;

    while (/[a-z]/iu.test(source[index] ?? '')) {
      index += 1;
    }

    if (source[index] === '-') {
      index += 1;
    }

    while (/\d/u.test(source[index] ?? '')) {
      index += 1;
    }

    if (source[index] === ' ') {
      index += 1;
    }
  }

  return output;
}
