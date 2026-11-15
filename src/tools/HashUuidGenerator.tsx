import { Check, Copy, KeyRound, RefreshCw, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

async function computeHash(message: string, algorithm: 'SHA-256' | 'SHA-512'): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function HashUuidGenerator() {
  const [inputText, setInputText] = useState('Oathan Rex');
  const [sha256, setSha256] = useState('');
  const [sha512, setSha512] = useState('');
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      computeHash(inputText, 'SHA-256'),
      computeHash(inputText, 'SHA-512'),
    ]).then(([h256, h512]) => {
      if (!active) return;
      setSha256(h256);
      setSha512(h512);
    });
    return () => {
      active = false;
    };
  }, [inputText]);

  useEffect(() => {
    generateNewUuids(3);
  }, []);

  const generateNewUuids = (count = 3) => {
    const arr = Array.from({ length: count }, () => generateUuid());
    setUuids(arr);
  };

  const copyStr = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  return (
    <div className="space-y-6">
      {/* Cryptographic Hash Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-muted)]">
          <ShieldCheck className="h-4 w-4 text-[var(--brand-accent)]" />
          WebCrypto Hashes
        </div>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type text to hash in real-time..."
          className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-card-bg)] px-4 py-2.5 font-mono text-xs text-[var(--brand-fg)] outline-none focus:border-[var(--brand-accent)]"
        />

        <div className="space-y-3">
          {[
            { label: 'SHA-256', val: sha256 },
            { label: 'SHA-512', val: sha512 },
          ].map((h) => (
            <div
              key={h.label}
              className="flex items-center justify-between rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface-2)] p-3"
            >
              <div className="min-w-0 pr-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-muted)]">
                  {h.label}
                </span>
                <div className="truncate font-mono text-xs text-[var(--brand-fg)]">
                  {h.val || 'Computing...'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyStr(h.label, h.val)}
                className="btn-icon h-7 w-7 shrink-0 text-[var(--brand-muted)] hover:text-[var(--brand-fg)]"
                title={`Copy ${h.label}`}
              >
                {copiedKey === h.label ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* UUID v4 Generator Section */}
      <div className="space-y-4 border-t border-[var(--brand-border)] pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-muted)]">
            <KeyRound className="h-4 w-4 text-[var(--brand-accent)]" />
            UUID v4 Generator
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => generateNewUuids(3)}
              className="btn-secondary text-xs py-1 px-2.5 h-auto"
            >
              <RefreshCw className="h-3 w-3" />
              Generate More
            </button>
            <button
              type="button"
              onClick={() => copyStr('all-uuid', uuids.join('\n'))}
              className="btn-primary text-xs py-1 px-2.5 h-auto"
            >
              {copiedKey === 'all-uuid' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              Copy All
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {uuids.map((u, i) => (
            <div
              key={u + i}
              className="flex items-center justify-between rounded-lg border border-[var(--brand-border)] bg-[var(--brand-card-bg)] px-3 py-2"
            >
              <span className="font-mono text-xs text-[var(--brand-fg)]">{u}</span>
              <button
                type="button"
                onClick={() => copyStr(u, u)}
                className="btn-icon h-6 w-6 text-[var(--brand-muted)] hover:text-[var(--brand-fg)]"
                title="Copy UUID"
              >
                {copiedKey === u ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
