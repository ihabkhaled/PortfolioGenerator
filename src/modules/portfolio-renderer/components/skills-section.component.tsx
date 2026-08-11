import type { ReactElement } from 'react';

import { Badge } from '@/packages/ui-primitives';

import { skillsClasses } from '../constants/template-style.constants';
import type { SkillsSectionProps } from '../types/section-props.types';

export function SkillsSection(props: Readonly<SkillsSectionProps>): ReactElement {
  return (
    <div className={skillsClasses.list} data-testid="skill-group-list">
      {props.groups.map((group) => (
        <div key={group.id} className={skillsClasses.group}>
          <h3 className={skillsClasses.label}>{group.label}</h3>
          <div className={skillsClasses.items}>
            {group.items.map((item) => (
              <Badge key={item} tone="neutral">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
