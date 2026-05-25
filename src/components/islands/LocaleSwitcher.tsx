import { useEffect, useRef, useState } from 'react';

type Locale = 'en' | 'pt' | 'es';

interface Props {
  current: Locale;
  alternates: Record<Locale, string>;
  labels: {
    label: string;
    en: string;
    pt: string;
    es: string;
  };
}

const LOCALE_ORDER: Locale[] = ['en', 'pt', 'es'];

export default function LocaleSwitcher({ current, alternates, labels }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onSelect = (locale: Locale) => {
    setOpen(false);
    try {
      localStorage.setItem('locale', locale);
    } catch (_) {}
  };

  const code = current.toUpperCase();

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={labels.label}
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'transparent',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem 0.75rem',
          color: 'var(--color-fg)',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 500,
          fontVariantNumeric: 'tabular-nums',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          height: '2.25rem',
          transition: 'background-color 150ms ease, border-color 150ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-bg-subtle)';
          e.currentTarget.style.borderColor = 'var(--color-border-strong)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'var(--color-border)';
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
        <span>{code}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={labels.label}
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.375rem)',
            right: 0,
            margin: 0,
            padding: '0.25rem',
            listStyle: 'none',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            minWidth: '10rem',
            zIndex: 50,
          }}
        >
          {LOCALE_ORDER.map((locale) => {
            const isCurrent = locale === current;
            return (
              <li key={locale}>
                <a
                  role="option"
                  aria-selected={isCurrent}
                  aria-current={isCurrent ? 'true' : undefined}
                  href={alternates[locale]}
                  onClick={() => onSelect(locale)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    color: 'var(--color-fg)',
                    background: isCurrent ? 'var(--color-bg-subtle)' : 'transparent',
                    fontWeight: isCurrent ? 600 : 400,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-bg-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isCurrent
                      ? 'var(--color-bg-subtle)'
                      : 'transparent';
                  }}
                >
                  <span>{labels[locale]}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--color-fg-subtle)',
                    }}
                  >
                    {locale.toUpperCase()}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
