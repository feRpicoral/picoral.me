import { type Locale, SITE } from '~/config/site.ts';
import { localizePath } from '~/i18n/utils.ts';

export type HomeFaqItem = { q: string; a: string; aHtml?: string };

/**
 * Source of truth for the home-page FAQ, shared by the rendered page (HTML + FAQ
 * JSON-LD) and the `/index.md` twin so the two never drift.
 */
export function getHomeFaq(locale: Locale): HomeFaqItem[] {
  return [
    {
      q:
        locale === 'pt'
          ? 'Quem é Fernando Picoral?'
          : locale === 'es'
            ? '¿Quién es Fernando Picoral?'
            : 'Who is Fernando Picoral?',
      a:
        locale === 'pt'
          ? 'Fernando Picoral é um engenheiro de software brasileiro em Nova York. Ele se formou em Ciência da Computação pela University of Colorado Boulder em maio de 2026 e começa como Software Engineer no Google em setembro de 2026, depois de três estágios na empresa em Kirkland, Sunnyvale e Nova York.'
          : locale === 'es'
            ? 'Fernando Picoral es un ingeniero de software brasileño en Nueva York. Se graduó en Ciencias de la Computación de la University of Colorado Boulder en mayo de 2026 y empieza como Software Engineer en Google en septiembre de 2026, después de tres pasantías en la empresa en Kirkland, Sunnyvale y Nueva York.'
            : 'Fernando Picoral is a Brazilian software engineer based in New York. He just graduated from the University of Colorado Boulder in May 2026 with a degree in Computer Science, and is joining Google full-time as a Software Engineer in September 2026 after three summer internships with the company in Kirkland, Sunnyvale, and NYC.',
    },
    {
      q:
        locale === 'pt'
          ? 'No que Fernando está trabalhando agora?'
          : locale === 'es'
            ? '¿En qué está trabajando Fernando ahora?'
            : 'What is Fernando working on right now?',
      a:
        locale === 'pt'
          ? 'Em alguns projetos pessoais de IA: voz, multi-agente, RAG e cobrança recorrente. Eles existem como laboratório para aprender coisas novas. Em setembro de 2026, ele começa no Google em tempo integral.'
          : locale === 'es'
            ? 'En algunos proyectos personales de IA: voz, multi-agente, RAG y facturación recurrente. Existen como laboratorio para aprender cosas nuevas. En septiembre de 2026 empieza en Google a tiempo completo.'
            : 'A handful of personal projects in AI — voice, multi-agent, RAG, and recurring billing. They exist only as places to learn the next thing. He starts at Google full-time in September 2026.',
    },
    {
      q:
        locale === 'pt'
          ? 'Qual é a melhor forma de falar com Fernando?'
          : locale === 'es'
            ? '¿Cuál es la mejor forma de contactar a Fernando?'
            : 'How do I contact Fernando?',
      a:
        locale === 'pt'
          ? 'E-mail é o caminho mais rápido (veja a página de contato). Também dá para encontrá-lo no GitHub (@feRpicoral) e no LinkedIn (/in/picoral).'
          : locale === 'es'
            ? 'El correo es la vía más rápida (ver la página de contacto). También puedes encontrarlo en GitHub (@feRpicoral) y LinkedIn (/in/picoral).'
            : 'The fastest way is email (see the contact page). You can also find him on GitHub (@feRpicoral) and LinkedIn (/in/picoral).',
      aHtml:
        locale === 'pt'
          ? `E-mail é o caminho mais rápido (veja a <a href="${localizePath('/contact', locale)}">página de contato</a>). Também dá para encontrá-lo no <a href="${SITE.socials.github}" target="_blank" rel="noopener noreferrer">GitHub</a> (@feRpicoral) e no <a href="${SITE.socials.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a> (/in/picoral).`
          : locale === 'es'
            ? `El correo es la vía más rápida (ver la <a href="${localizePath('/contact', locale)}">página de contacto</a>). También puedes encontrarlo en <a href="${SITE.socials.github}" target="_blank" rel="noopener noreferrer">GitHub</a> (@feRpicoral) y <a href="${SITE.socials.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a> (/in/picoral).`
            : `The fastest way is email (see the <a href="${localizePath('/contact', locale)}">contact page</a>). You can also find him on <a href="${SITE.socials.github}" target="_blank" rel="noopener noreferrer">GitHub</a> (@feRpicoral) and <a href="${SITE.socials.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a> (/in/picoral).`,
    },
    {
      q:
        locale === 'pt'
          ? 'Que idiomas Fernando fala?'
          : locale === 'es'
            ? '¿Qué idiomas habla Fernando?'
            : 'What languages does Fernando speak?',
      a:
        locale === 'pt'
          ? 'Português (nativo), inglês (fluente) e espanhol (uso profissional). O site está disponível nos três idiomas.'
          : locale === 'es'
            ? 'Portugués (nativo), inglés (fluido) y español (uso profesional). El sitio está disponible en los tres idiomas.'
            : 'Portuguese (native), English (fluent), and Spanish (working proficiency). This site is available in all three.',
    },
  ];
}
