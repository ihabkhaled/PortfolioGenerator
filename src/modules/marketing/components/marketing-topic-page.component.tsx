import type { ReactElement } from 'react';

import { Section } from '@/shared/components/data-display/section.component';
import { sectionClasses } from '@/shared/components/data-display/section.variants';

import { topicClasses } from '../constants/marketing-style.constants';
import type { MarketingTopicPageProps } from '../types/marketing.types';

export function MarketingTopicPage(props: Readonly<MarketingTopicPageProps>): ReactElement {
  return (
    <>
      <header className={topicClasses.hero}>
        <p className={topicClasses.eyebrow}>{props.eyebrow}</p>
        <h1 className={topicClasses.title}>{props.title}</h1>
        <p className={topicClasses.lead}>{props.description}</p>
      </header>
      <div className={sectionClasses.page}>
        {props.sections.map((section) => (
          <Section
            key={section.kind}
            headingId={`${props.title}-${section.kind}`}
            eyebrow={props.eyebrow}
            title={section.title}
          >
            <p className={topicClasses.sectionBody}>{section.body}</p>
          </Section>
        ))}
        <Section headingId={`${props.title}-related`} eyebrow={props.eyebrow} title={props.title}>
          <nav aria-label={props.title} className={topicClasses.related}>
            {props.related}
          </nav>
        </Section>
      </div>
    </>
  );
}
