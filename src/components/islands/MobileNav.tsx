import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface NavLink {
  label: string;
  href: string;
  current?: boolean;
}

interface Props {
  items: NavLink[];
  labels: {
    open: string;
    close: string;
  };
}

/**
 * Matches the CSS animation duration in `.mobile-nav-dialog.is-closing`.
 * Used to delay unmount so the close animation can play out.
 */
const CLOSE_ANIMATION_MS = 220;

export default function MobileNav({ items, labels }: Props) {
  const [open, setOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Guard the portal target — `document.body` is only available client-side.
  // Without this, the dialog renders inside the <header>, which has
  // `backdrop-filter` and thereby establishes a containing block for fixed
  // descendants. The result was the dialog being clipped to the header's box.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Open/close lifecycle. On open: mount immediately, lock body scroll, wire
  // up key handlers. On close: keep the dialog mounted long enough for the
  // close animation to play, then unmount + release scroll lock.
  useEffect(() => {
    if (open) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';

      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setOpen(false);
          openerRef.current?.focus();
        }
        if (e.key === 'Tab' && dialogRef.current) {
          const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
            'a, button, [tabindex]:not([tabindex="-1"])',
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }

    // open just flipped false — let the exit animation play, then unmount.
    const t = setTimeout(() => {
      setShouldRender(false);
      document.body.style.overflow = '';
    }, CLOSE_ANIMATION_MS);
    return () => clearTimeout(t);
  }, [open]);

  // Focus the first link once the dialog is on screen.
  useEffect(() => {
    if (shouldRender && open) firstLinkRef.current?.focus();
  }, [shouldRender, open]);

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={labels.open}
        aria-expanded={open}
        aria-controls="mobile-nav-dialog"
        style={{
          background: 'transparent',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem',
          width: '2.25rem',
          height: '2.25rem',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-fg)',
          cursor: 'pointer',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>
      {shouldRender &&
        mounted &&
        createPortal(
          <div
            ref={dialogRef}
            id="mobile-nav-dialog"
            // biome-ignore lint/a11y/useSemanticElements: <dialog> would require .showModal() and break the existing custom modal animation/escape handling.
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className={`mobile-nav-dialog ${open ? 'is-open' : 'is-closing'}`}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              padding: '1.25rem',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '2rem',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openerRef.current?.focus();
                }}
                aria-label={labels.close}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem',
                  width: '2.25rem',
                  height: '2.25rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-fg)',
                  cursor: 'pointer',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <line x1="6" x2="18" y1="6" y2="18" />
                  <line x1="6" x2="18" y1="18" y2="6" />
                </svg>
              </button>
            </div>
            <nav aria-label="Mobile primary">
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {items.map((item, idx) => (
                  <li key={item.href}>
                    <a
                      ref={idx === 0 ? firstLinkRef : undefined}
                      href={item.href}
                      aria-current={item.current ? 'page' : undefined}
                      onClick={() => setOpen(false)}
                      style={{
                        display: 'block',
                        padding: '0.875rem 0.5rem',
                        fontSize: '1.5rem',
                        fontWeight: item.current ? 600 : 400,
                        color: item.current ? 'var(--color-accent)' : 'var(--color-fg)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--color-border)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}
