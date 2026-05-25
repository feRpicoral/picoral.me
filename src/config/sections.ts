export type SectionConfig = {
  enabled: boolean;
  alwaysOn?: true;
};

export const sections = {
  home: { enabled: true, alwaysOn: true },
  about: { enabled: true, alwaysOn: true },
  experience: { enabled: true, alwaysOn: true },
  projects: { enabled: true, alwaysOn: true },
  contact: { enabled: true, alwaysOn: true },
  projectCaseStudies: { enabled: true },
  blog: { enabled: false },
  now: { enabled: false },
  uses: { enabled: false },
} as const satisfies Record<string, SectionConfig>;

export type SectionKey = keyof typeof sections;

export const isEnabled = (key: SectionKey): boolean => sections[key].enabled;
