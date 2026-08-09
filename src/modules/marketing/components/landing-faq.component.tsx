import type { ReactElement } from 'react';

import { faqClasses } from '../constants/marketing-style.constants';
import type { LandingFaqProps } from '../types/marketing.types';

export function LandingFaq(props: Readonly<LandingFaqProps>): ReactElement {
  return (
    <div className={faqClasses.list}>
      {props.items.map((item) => (
        <details key={item.id} className={faqClasses.item}>
          <summary className={faqClasses.question}>{item.question}</summary>
          <p className={faqClasses.answer}>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
