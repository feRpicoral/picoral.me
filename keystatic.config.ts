import { collection, config, fields, singleton } from '@keystatic/core';
import { block } from '@keystatic/core/content-components';

const projectStatusOptions = [
  { label: 'Live', value: 'live' },
  { label: 'Beta', value: 'beta' },
  { label: 'In development', value: 'in-development' },
  { label: 'Archived', value: 'archived' },
] as const;

const employmentTypeOptions = [
  { label: 'Full-time', value: 'fulltime' },
  { label: 'Internship', value: 'internship' },
  { label: 'Founder', value: 'founder' },
  { label: 'Research', value: 'research' },
  { label: 'Contract', value: 'contract' },
] as const;

const PERIOD_DATE_DESCRIPTION =
  'Only the month and year are shown on the site; the day is ignored. Use the first day of the month.';

const periodFields = () => ({
  start: fields.date({
    label: 'Start',
    description: PERIOD_DATE_DESCRIPTION,
    validation: { isRequired: true },
  }),
  end: fields.date({
    label: 'End',
    description: PERIOD_DATE_DESCRIPTION,
  }),
});

const projectImage = block({
  label: 'Project image',
  schema: {
    src: fields.image({
      label: 'Image',
      directory: 'src/assets/projects',
      publicPath: '/src/assets/projects/',
      validation: { isRequired: true },
    }),
    alt: fields.text({
      label: 'Alt text',
      validation: { isRequired: true, length: { max: 180 } },
    }),
    caption: fields.text({ label: 'Caption', multiline: true }),
    size: fields.select({
      label: 'Size',
      options: [
        { label: 'Prose', value: 'prose' },
        { label: 'Chart', value: 'chart' },
        { label: 'Wide', value: 'wide' },
      ],
      defaultValue: 'prose',
    }),
  },
  ContentView: ({ value }) => value.caption || value.alt || 'Project image',
});

export default config({
  storage: {
    kind: 'local',
  },
  ui: {
    brand: {
      name: 'picoral.me',
    },
    navigation: {
      Content: ['projects', 'experience'],
    },
  },
  singletons: {
    experience: singleton({
      label: 'Experience',
      path: 'src/content/experience/en/index',
      entryLayout: 'form',
      format: { contentField: 'content' },
      schema: {
        education: fields.array(
          fields.object(
            {
              degree: fields.text({
                label: 'Degree',
                validation: { isRequired: true },
              }),
              school: fields.text({
                label: 'School',
                validation: { isRequired: true },
              }),
              detail: fields.text({
                label: 'Detail',
                validation: { isRequired: true },
              }),
              period: fields.object(periodFields(), {
                label: 'Period',
                layout: [6, 6],
              }),
              location: fields.text({
                label: 'Location',
                validation: { isRequired: true },
              }),
            },
            { label: 'Education item' },
          ),
          {
            label: 'Education',
            itemLabel: (props) =>
              props.fields.degree.value || props.fields.school.value || 'Education item',
          },
        ),
        work: fields.array(
          fields.object(
            {
              company: fields.text({
                label: 'Company',
                validation: { isRequired: true },
              }),
              role: fields.text({
                label: 'Role',
                validation: { isRequired: true },
              }),
              location: fields.text({
                label: 'Location',
                validation: { isRequired: true },
              }),
              period: fields.object(periodFields(), {
                label: 'Period',
                layout: [6, 6],
              }),
              summary: fields.text({
                label: 'Summary',
                multiline: true,
                validation: { isRequired: true },
              }),
              highlights: fields.array(
                fields.text({
                  label: 'Highlight',
                  validation: { isRequired: true },
                }),
                {
                  label: 'Highlights',
                  itemLabel: (props) => props.value,
                },
              ),
              tech: fields.array(fields.text({ label: 'Technology' }), {
                label: 'Tech',
                itemLabel: (props) => props.value,
              }),
              type: fields.select({
                label: 'Type',
                options: employmentTypeOptions,
                defaultValue: 'fulltime',
              }),
              link: fields.url({ label: 'Link' }),
              order: fields.number({
                label: 'Order',
                validation: { isRequired: true },
              }),
            },
            { label: 'Work item' },
          ),
          {
            label: 'Work',
            itemLabel: (props) =>
              props.fields.role.value || props.fields.company.value || 'Work item',
          },
        ),
        content: fields.emptyContent({ extension: 'md' }),
      },
    }),
  },
  collections: {
    projects: collection({
      label: 'Projects',
      path: 'src/content/projects/en/*',
      slugField: 'slug',
      entryLayout: 'content',
      format: { contentField: 'content' },
      columns: ['title', 'status', 'featured', 'hasCaseStudy'],
      schema: {
        slug: fields.slug({
          name: {
            label: 'Slug',
            validation: { isRequired: true },
          },
          slug: {
            label: 'File slug',
          },
        }),
        title: fields.text({
          label: 'Title',
          validation: { isRequired: true },
        }),
        tagline: fields.text({
          label: 'Tagline',
          multiline: true,
          validation: { isRequired: true, length: { max: 260 } },
        }),
        summary: fields.text({
          label: 'Summary',
          multiline: true,
          validation: { isRequired: true },
        }),
        status: fields.select({
          label: 'Status',
          options: projectStatusOptions,
          defaultValue: 'in-development',
        }),
        role: fields.text({
          label: 'Role',
          validation: { isRequired: true },
        }),
        period: fields.object(
          {
            start: fields.text({
              label: 'Start',
              validation: { isRequired: true },
            }),
            end: fields.text({ label: 'End' }),
          },
          { label: 'Period', layout: [6, 6] },
        ),
        stack: fields.array(
          fields.text({
            label: 'Technology',
            validation: { isRequired: true },
          }),
          {
            label: 'Stack',
            itemLabel: (props) => props.value,
          },
        ),
        links: fields.object(
          {
            live: fields.url({ label: 'Live URL' }),
            repo: fields.url({ label: 'Repository URL' }),
            demo: fields.url({ label: 'Demo URL' }),
          },
          { label: 'Links' },
        ),
        cover: fields.image({
          label: 'Cover image',
          directory: 'src/assets/projects',
          publicPath: '@assets/projects/',
        }),
        coverAlt: fields.text({
          label: 'Cover alt text',
          validation: { length: { max: 180 } },
        }),
        featured: fields.checkbox({
          label: 'Featured',
          defaultValue: false,
        }),
        order: fields.number({
          label: 'Order',
          validation: { isRequired: true },
        }),
        hasCaseStudy: fields.checkbox({
          label: 'Has case study',
          defaultValue: false,
        }),
        draft: fields.checkbox({
          label: 'Draft',
          defaultValue: false,
        }),
        seo: fields.object(
          {
            description: fields.text({
              label: 'Description',
              multiline: true,
              validation: { isRequired: true, length: { max: 220 } },
            }),
            keywords: fields.array(fields.text({ label: 'Keyword' }), {
              label: 'Keywords',
              itemLabel: (props) => props.value,
            }),
          },
          { label: 'SEO' },
        ),
        faq: fields.array(
          fields.object(
            {
              q: fields.text({
                label: 'Question',
                validation: { isRequired: true },
              }),
              a: fields.text({
                label: 'Answer',
                multiline: true,
                validation: { isRequired: true },
              }),
            },
            { label: 'FAQ item' },
          ),
          {
            label: 'FAQ',
            itemLabel: (props) => props.fields.q.value || 'Question',
          },
        ),
        content: fields.mdx({
          label: 'Body',
          components: {
            ProjectImage: projectImage,
          },
        }),
      },
    }),
  },
});
