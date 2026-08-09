import { strToU8, zipSync } from 'fflate';

import type { DocxFixtureOptions } from './document-text.types';

export function buildDocxFixture(text: string, options: DocxFixtureOptions = {}): Uint8Array {
  const schemasBase = ['http:', '', 'schemas.openxmlformats.org'].join('/');
  const wordNamespace = `${schemasBase}/wordprocessingml/2006/main`;
  const paragraphs = text
    .split('\n')
    .map((line) => `<w:p><w:r><w:t>${escapeXml(line)}</w:t></w:r></w:p>`)
    .join('');
  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(
      `<?xml version="1.0"?><Types xmlns="${schemasBase}/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
    ),
    '_rels/.rels': strToU8(
      options.externalRelationship
        ? `<?xml version="1.0"?><Relationships xmlns="${schemasBase}/package/2006/relationships"><Relationship Id="rId1" Type="external" Target="https://example.test/resume" TargetMode="External"/></Relationships>`
        : `<?xml version="1.0"?><Relationships xmlns="${schemasBase}/package/2006/relationships"><Relationship Id="rId1" Type="${schemasBase}/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    ),
    'word/document.xml': strToU8(
      `<?xml version="1.0"?><w:document xmlns:w="${wordNamespace}"><w:body>${paragraphs}</w:body></w:document>`,
    ),
  };

  if (options.macro) {
    files['word/vbaProject.bin'] = strToU8('macro');
  }

  return zipSync(files);
}

export function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
