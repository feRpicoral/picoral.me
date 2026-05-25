import { Command } from 'cmdk';
import { useEffect, useState } from 'react';

interface CommandItem {
  group: string;
  label: string;
  href: string;
  hint?: string;
}

interface Props {
  items: CommandItem[];
  placeholder: string;
}

export default function CommandPalette({ items, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const groups = items.reduce<Record<string, CommandItem[]>>((acc, item) => {
    acc[item.group] = acc[item.group] ?? [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '6rem 1rem 1rem',
        background: 'oklch(0% 0 0 / 0.35)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <Command
        label="Command palette"
        style={{
          width: '100%',
          maxWidth: '32rem',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
        }}
      >
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '1rem 1.25rem',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-fg)',
            fontSize: '1rem',
            outline: 'none',
            borderBottom: '1px solid var(--color-border)',
          }}
        />
        <Command.List
          style={{
            padding: '0.5rem',
            maxHeight: '20rem',
            overflowY: 'auto',
          }}
        >
          <Command.Empty
            style={{
              padding: '1.5rem',
              textAlign: 'center',
              color: 'var(--color-fg-muted)',
              fontSize: '0.875rem',
            }}
          >
            No results.
          </Command.Empty>
          {Object.entries(groups).map(([group, groupItems]) => (
            <Command.Group
              key={group}
              heading={group}
              style={
                {
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-fg-subtle)',
                  '--cmdk-group-heading-padding': '0.5rem 0.75rem 0.25rem',
                } as React.CSSProperties
              }
            >
              {groupItems.map((item) => (
                <Command.Item
                  key={item.href}
                  value={`${item.group} ${item.label} ${item.hint ?? ''}`}
                  onSelect={() => {
                    window.location.href = item.href;
                  }}
                  style={{
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-fg)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <span>{item.label}</span>
                  {item.hint && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-fg-subtle)',
                      }}
                    >
                      {item.hint}
                    </span>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
      </Command>
    </div>
  );
}
