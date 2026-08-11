import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildFullPortfolioDocument } from '@/tests/fixtures/portfolio-document.fixtures';

import { EDITOR_ISSUE_DIRECT_CONTROLS } from '../constants/editor.constants';
import {
  buildSafeIssueIdentifier,
  findIssueControls,
  focusEditorIssueTarget,
  setIssueControlState,
} from '../helpers/editor-issue-navigation.helper';
import {
  resolveCollectionTarget,
  resolveEditorIssueTarget,
  resolvePageTarget,
} from '../helpers/editor-issue-target.helper';

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('editor issue navigation helpers', () => {
  it('creates stable opaque identifiers and tolerates a missing code point', () => {
    const issue = { path: ['pages', 0, 'title'], code: 'too_small' } as const;
    expect(buildSafeIssueIdentifier(issue)).toMatch(/^[0-9A-F]{8}$/u);
    expect(buildSafeIssueIdentifier(issue)).toBe(buildSafeIssueIdentifier(issue));

    vi.spyOn(String.prototype, 'codePointAt').mockReturnValue(undefined);
    expect(buildSafeIssueIdentifier(issue)).toBe('71B253E7');
  });

  it('finds only real controls and adds then removes issue semantics', () => {
    const control = document.createElement('input');
    control.id = 'known-control';
    document.body.append(control);

    const controls = findIssueControls([
      { controlId: 'known-control', disclosureIds: [] },
      { controlId: 'missing-control', disclosureIds: [] },
    ]);
    expect(controls).toEqual([control]);

    setIssueControlState(controls, 'issue-message', true);
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toHaveAttribute('aria-describedby', 'issue-message');
    setIssueControlState(controls, 'issue-message', false);
    expect(control).not.toHaveAttribute('aria-invalid');
    expect(control).not.toHaveAttribute('aria-describedby');
  });

  it('opens details, ignores non-details ancestors, focuses a control, and tolerates no control', () => {
    const disclosure = document.createElement('details');
    disclosure.id = 'real-disclosure';
    const nonDisclosure = document.createElement('div');
    nonDisclosure.id = 'not-a-disclosure';
    const control = document.createElement('input');
    control.id = 'target-control';
    document.body.append(disclosure, nonDisclosure, control);

    focusEditorIssueTarget({
      controlId: 'target-control',
      disclosureIds: ['real-disclosure', 'not-a-disclosure'],
    });
    expect(disclosure.open).toBe(true);
    expect(control).toHaveFocus();

    expect(() => {
      focusEditorIssueTarget({ controlId: 'missing-control', disclosureIds: [] });
    }).not.toThrow();
  });
});

describe('editor issue target helpers', () => {
  it('rejects malformed, missing, and unsupported page targets', () => {
    const value = buildFullPortfolioDocument();
    expect(
      resolvePageTarget(value, { path: ['pages', 'one', 'title'], code: 'custom' }),
    ).toBeNull();
    expect(resolvePageTarget(value, { path: ['pages', 99, 'title'], code: 'custom' })).toBeNull();
    expect(resolvePageTarget(value, { path: ['pages', 0, 4], code: 'custom' })).toBeNull();
    expect(
      resolvePageTarget(value, { path: ['pages', 0, 'passwordHash'], code: 'custom' }),
    ).toBeNull();
    expect(resolvePageTarget(value, { path: ['pages', 0, 'navLabel'], code: 'custom' })).toEqual({
      controlId: 'page-home-nav',
      disclosureIds: ['editor-pages', 'editor-page-page-home'],
    });
    expect(resolvePageTarget(value, { path: ['pages', 0, 'sections'], code: 'custom' })).toEqual({
      controlId: 'editor-sections-list',
      disclosureIds: ['editor-sections'],
    });
    expect(resolvePageTarget(value, { path: ['pages', 0, 'title'], code: 'custom' })).toEqual({
      controlId: 'page-home-title',
      disclosureIds: ['editor-pages', 'editor-page-page-home'],
    });
  });

  it('rejects malformed, unknown, non-array, and missing collection entries', () => {
    const value = buildFullPortfolioDocument();
    expect(resolveCollectionTarget(value, { path: [0, 0, 'name'], code: 'custom' })).toBeNull();
    expect(
      resolveCollectionTarget(value, { path: ['projects', 'zero', 'name'], code: 'custom' }),
    ).toBeNull();
    expect(resolveCollectionTarget(value, { path: ['projects', 0, 2], code: 'custom' })).toBeNull();
    expect(
      resolveCollectionTarget(value, { path: ['unknown', 0, 'name'], code: 'custom' }),
    ).toBeNull();
    expect(
      resolveCollectionTarget({ ...value, projects: {} } as unknown as typeof value, {
        path: ['projects', 0, 'name'],
        code: 'custom',
      }),
    ).toBeNull();
    expect(
      resolveCollectionTarget(value, { path: ['projects', 0, 'name'], code: 'custom' }),
    ).toEqual({
      controlId: 'projects-proj-1-name',
      disclosureIds: ['editor-collections', 'editor-collection-projects', 'editor-projects-proj-1'],
    });
    expect(
      resolveCollectionTarget({ ...value, projects: [{}] } as unknown as typeof value, {
        path: ['projects', 0, 'name'],
        code: 'custom',
      }),
    ).toBeNull();
  });

  it('keeps unknown and asset issues general and handles a direct target without an ancestor', () => {
    const value = buildFullPortfolioDocument();
    expect(
      resolveEditorIssueTarget(value, { path: ['gallery', 0, 'alt'], code: 'custom' }),
    ).toBeNull();
    expect(resolveEditorIssueTarget(value, { path: ['unknown'], code: 'custom' })).toBeNull();
    expect(
      resolveEditorIssueTarget(value, { path: ['identity', 'displayName'], code: 'custom' }),
    ).toEqual({
      controlId: 'identity-display-name',
      disclosureIds: ['editor-identity'],
    });
    expect(
      resolveEditorIssueTarget(value, { path: ['pages', 0, 'title'], code: 'custom' }),
    ).toEqual({
      controlId: 'page-home-title',
      disclosureIds: ['editor-pages', 'editor-page-page-home'],
    });
    expect(
      resolveEditorIssueTarget(value, { path: ['projects', 0, 'name'], code: 'custom' }),
    ).toEqual({
      controlId: 'projects-proj-1-name',
      disclosureIds: ['editor-collections', 'editor-collection-projects', 'editor-projects-proj-1'],
    });

    const mutableControls = EDITOR_ISSUE_DIRECT_CONTROLS as Record<string, string>;
    mutableControls['0'] = 'synthetic-control';
    try {
      expect(resolveEditorIssueTarget(value, { path: [0], code: 'custom' })).toEqual({
        controlId: 'synthetic-control',
        disclosureIds: [],
      });
    } finally {
      delete mutableControls['0'];
    }
  });
});
