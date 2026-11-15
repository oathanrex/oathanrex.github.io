import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { label: 'Open Command Palette', keys: ['Ctrl', 'K'] },
  { label: 'Focus Project Search', keys: ['/'] },
  { label: 'Toggle Light / Dark Theme', keys: ['T'] },
  { label: 'Switch to Grid View', keys: ['G'] },
  { label: 'Switch to List View', keys: ['L'] },
  { label: 'Toggle Shortcuts Help', keys: ['?'] },
  { label: 'Close Active Dialog', keys: ['Esc'] },
];

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      <div
        className="modal-panel max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--brand-border)] pb-4">
          <h3
            id="shortcuts-modal-title"
            className="font-display text-lg font-bold text-[var(--brand-fg)]"
          >
            Keyboard Shortcuts
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts dialog"
            className="btn-icon h-9 w-9 text-[var(--brand-muted)] hover:text-[var(--brand-fg)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <dl className="mt-4 divide-y divide-[var(--brand-border-subtle)]">
          {SHORTCUTS.map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2.5 text-sm">
              <dt className="text-[var(--brand-muted)]">{item.label}</dt>
              <dd className="flex items-center gap-1">
                {item.keys.map((key) => (
                  <kbd
                    key={key}
                    className="rounded border border-[var(--brand-border)] bg-[var(--brand-well)] px-2 py-0.5 font-mono text-xs text-[var(--brand-fg)]"
                  >
                    {key}
                  </kbd>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
