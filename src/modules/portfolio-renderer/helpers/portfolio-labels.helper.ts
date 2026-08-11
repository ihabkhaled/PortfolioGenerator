import type { PortfolioLabels } from '../types/renderer.types';

/**
 * Assemble the template's chrome labels from a resolved translator.
 *
 * A single function rather than eleven call sites: the template renders the
 * same words on the public route, the owner preview and every test fixture,
 * and three places that each build the object by hand will drift.
 */
export function buildPortfolioLabels(translate: (key: string) => string): PortfolioLabels {
  return {
    sections: {
      hero: translate('sections.hero'),
      about: translate('sections.about'),
      experience: translate('sections.experience'),
      projects: translate('sections.projects'),
      skills: translate('sections.skills'),
      education: translate('sections.education'),
      certifications: translate('sections.certifications'),
      languages: translate('sections.languages'),
      contact: translate('sections.contact'),
      custom: translate('sections.custom'),
      courses: translate('supplemental.courses'),
      awards: translate('supplemental.awards'),
      publications: translate('supplemental.publications'),
      volunteering: translate('supplemental.volunteering'),
      testimonials: translate('supplemental.testimonials'),
      interests: translate('supplemental.interests'),
      gallery: translate('supplemental.gallery'),
      attachments: translate('supplemental.attachments'),
      'soft-skills': translate('supplemental.softSkills'),
      social: translate('sections.contact'),
    },
    present: translate('present'),
    emailLabel: translate('emailLabel'),
    phoneLabel: translate('phoneLabel'),
    locationLabel: translate('locationLabel'),
    nationalityLabel: translate('nationalityLabel'),
    militaryStatusLabel: translate('militaryStatusLabel'),
    availability: translate('availability'),
    contactCta: translate('contactCta'),
    skipToContent: translate('skipToContent'),
    builtWith: translate('builtWith'),
    navigationLabel: translate('navigationLabel'),
    homeLabel: translate('homeLabel'),
    platformName: translate('platformName'),
    menuToggleLabel: translate('menuToggleLabel'),
    portraitAlt: translate('portraitAlt'),
    galleryClose: translate('galleryClose'),
    supplemental: {
      softSkills: translate('supplemental.softSkills'),
      courses: translate('supplemental.courses'),
      publications: translate('supplemental.publications'),
      volunteering: translate('supplemental.volunteering'),
      awards: translate('supplemental.awards'),
      interests: translate('supplemental.interests'),
      testimonials: translate('supplemental.testimonials'),
      gallery: translate('supplemental.gallery'),
      attachments: translate('supplemental.attachments'),
    },
  };
}
