import { useState } from 'react';

interface Props {
  user: string;
  domain: string;
  labels: {
    copy: string;
    copied: string;
  };
}

// Construct the literal address only client-side so server-rendered HTML never contains it.
export default function CopyEmail({ user, domain, labels }: Props) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(`${user}@${domain}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (_) {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={labels.copy}
      style={{
        background: 'transparent',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '0.375rem 0.75rem',
        color: copied ? 'var(--color-accent)' : 'var(--color-fg-muted)',
        cursor: 'pointer',
        fontSize: '0.875rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        transition: 'all 150ms ease',
      }}
    >
      {copied ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{labels.copied}</span>
        </>
      ) : (
        <>
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
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          <span>{labels.copy}</span>
        </>
      )}
    </button>
  );
}
