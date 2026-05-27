import { type SectionKey, isEnabled } from './sections.ts';

export type NavItem = {
  labelKey: string;
  href: string;
  section: SectionKey;
};

const ALL_NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.about', href: '/about', section: 'about' },
  { labelKey: 'nav.projects', href: '/projects', section: 'projects' },
  { labelKey: 'nav.experience', href: '/experience', section: 'experience' },
  { labelKey: 'nav.blog', href: '/blog', section: 'blog' },
  { labelKey: 'nav.now', href: '/now', section: 'now' },
  { labelKey: 'nav.uses', href: '/uses', section: 'uses' },
  { labelKey: 'nav.contact', href: '/contact', section: 'contact' },
];

export const NAV_ITEMS: NavItem[] = ALL_NAV_ITEMS.filter((item) => isEnabled(item.section));
