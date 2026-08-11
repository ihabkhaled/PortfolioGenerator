import type { EditorIssue, EditorIssueTarget } from '../types/editor.types';

export function buildSafeIssueIdentifier(issue: EditorIssue): string {
  const source = `${issue.code}:${issue.path.map(String).join('.')}`;
  let hash = 2_166_136_261;
  for (const character of source) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

export function findIssueControls(targets: readonly EditorIssueTarget[]): readonly HTMLElement[] {
  return targets
    .map((target) => globalThis.document.querySelector(`#${CSS.escape(target.controlId)}`))
    .filter((control): control is HTMLElement => control instanceof HTMLElement);
}

export function setIssueControlState(
  controls: readonly HTMLElement[],
  messageId: string,
  invalid: boolean,
): void {
  for (const control of controls) {
    if (invalid) {
      control.setAttribute('aria-invalid', String(true));
      control.setAttribute('aria-describedby', messageId);
    } else {
      control.removeAttribute('aria-invalid');
      control.removeAttribute('aria-describedby');
    }
  }
}

export function focusEditorIssueTarget(target: EditorIssueTarget): void {
  for (const id of target.disclosureIds) {
    const disclosure = globalThis.document.querySelector(`#${CSS.escape(id)}`);
    if (disclosure instanceof HTMLDetailsElement) disclosure.open = true;
  }
  const control = globalThis.document.querySelector(`#${CSS.escape(target.controlId)}`);
  if (!(control instanceof HTMLElement)) return;
  control.scrollIntoView({ block: 'center', behavior: 'smooth' });
  control.focus({ preventScroll: true });
}
