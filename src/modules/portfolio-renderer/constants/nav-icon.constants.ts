import {
  ExperienceIcon,
  InfoIcon,
  MessageIcon,
  ProjectsIcon,
  SkillsIcon,
  type AppIcon,
} from '@/packages/icons';

/**
 * Icon per well-known imported page slug (`IMPORTED_PAGE_DEFINITIONS`,
 * `@/modules/ai`). A page an owner renamed or created from scratch has no
 * entry here and renders with its label alone — a guessed icon on a page
 * about something else is worse than no icon.
 */
export const NAV_ICON_BY_SLUG: Readonly<Record<string, AppIcon>> = {
  experience: ExperienceIcon,
  projects: ProjectsIcon,
  skills: SkillsIcon,
  about: InfoIcon,
  contact: MessageIcon,
};
