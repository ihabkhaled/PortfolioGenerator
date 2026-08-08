import type { ReactElement } from 'react';

import { customBlockClasses } from '../constants/template-style.constants';
import type { CustomSectionProps } from '../types/section-props.types';

/**
 * The bounded block vocabulary, rendered.
 *
 * Every branch here is a fixed element with fixed classes. There is no HTML
 * path, no markdown path, and no `dangerouslySetInnerHTML` — a user composing
 * a custom section is choosing from a menu, not writing markup.
 */
export function CustomSection(props: Readonly<CustomSectionProps>): ReactElement {
  return (
    <div className={customBlockClasses.wrapper}>
      {props.blocks.map((block) => {
        if (block.kind === 'paragraph') {
          return (
            <p key={block.id} className={customBlockClasses.paragraph}>
              {block.text}
            </p>
          );
        }

        if (block.kind === 'bullet-list') {
          return (
            <ul key={block.id} className={customBlockClasses.bulletList}>
              {block.items.map((item) => (
                <li key={item} className={customBlockClasses.bulletItem}>
                  <span className={customBlockClasses.bulletMarker} aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.kind === 'stat-list') {
          return (
            <dl key={block.id} className={customBlockClasses.statList}>
              {block.items.map((item) => (
                <div key={item.id} className={customBlockClasses.statItem}>
                  <dt className={customBlockClasses.statLabel}>{item.label}</dt>
                  <dd className={customBlockClasses.statValue}>{item.value}</dd>
                </div>
              ))}
            </dl>
          );
        }

        return (
          <div key={block.id} className={customBlockClasses.links}>
            {props.renderLinkBlock(block)}
          </div>
        );
      })}
    </div>
  );
}
