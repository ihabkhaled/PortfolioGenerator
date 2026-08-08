import type { ReactElement } from 'react';

import { Badge } from '@/packages/ui-primitives';

import { projectClasses } from '../constants/template-style.constants';
import type { ProjectsSectionProps } from '../types/section-props.types';

export function ProjectsSection(props: Readonly<ProjectsSectionProps>): ReactElement {
  return (
    <div className={projectClasses.list}>
      {props.projects.map((project) => (
        <article key={project.id} className={projectClasses.item}>
          <h3 className={projectClasses.name}>{project.name}</h3>
          {project.summary === null ? null : (
            <p className={projectClasses.summary}>{project.summary}</p>
          )}
          {project.highlights.length === 0 ? null : (
            <ul className={projectClasses.highlights}>
              {project.highlights.map((highlight) => (
                <li key={highlight} className={projectClasses.highlight}>
                  <span className={projectClasses.highlightMarker} aria-hidden />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          )}
          {project.technologies.length === 0 ? null : (
            <div className={projectClasses.tags}>
              {project.technologies.map((technology) => (
                <Badge key={technology} tone="neutral">
                  {technology}
                </Badge>
              ))}
            </div>
          )}
          <div className={projectClasses.links}>{project.links}</div>
        </article>
      ))}
    </div>
  );
}
