import { Check, Copy, Sparkles, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

function toCamelCase(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/[\s_-]+/g, '');
}

function toKebabCase(str: string) {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((x) => x.toLowerCase())
    .join('-') || '';
}

function toSnakeCase(str: string) {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((x) => x.toLowerCase())
    .join('_') || '';
}

function toPascalCase(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/[\s_-]+/g, '');
}

export function TextTransformer() {
  const [input, setInput] = useState('Build privacy-first web utilities with Oathan Rex');
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  // Metrics
  const metrics = useMemo(() => {
    const chars = input.length;
    const charsNoSpaces = input.replace(/\s/g, '').length;
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const lines = input ? input.split('\n').length : 0;
    const bytes = new Blob([input]).size;
    return { chars, charsNoSpaces, words, lines, bytes };
  }, [input]);

  const applyTransformation = (type: string) => {
    let result = '';
    try {
      switch (type) {
        case 'camel':
          result = toCamelCase(input);
          break;
        case 'kebab':
          result = toKebabCase(input);
          break;
        case 'snake':
          result = toSnakeCase(input);
          break;
        case 'pascal':
          result = toPascalCase(input);
          break;
        case 'upper':
          result = input.toUpperCase();
          break;
        case 'lower':
          result = input.toLowerCase();
          break;
        case 'json-prettify':
          result = JSON.stringify(JSON.parse(input), null, 2);
          break;
        case 'json-minify':
          result = JSON.stringify(JSON.parse(input));
          break;
        default:
          result = input;
      }
      setInput(result);
      navigator.clipboard.writeText(result);
      setCopiedAction(type);
      setTimeout(() => setCopiedAction(null), 1600);
    } catch {
      alert('Could not format as JSON. Please ensure valid JSON syntax.');
    }
  };

  const copyCurrent = () => {
    navigator.clipboard.writeText(input);
    setCopiedAction('copy-raw');
    setTimeout(() => setCopiedAction(null), 1600);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Bar */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {[
          { label: 'Words', value: metrics.words },
          { label: 'Characters', value: metrics.chars },
          { label: 'No Spaces', value: metrics.charsNoSpaces },
          { label: 'Lines', value: metrics.lines },
          { label: 'Byte Size', value: `${metrics.bytes} B` },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-2)] p-2.5 text-center"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-muted)]">
              {m.label}
            </div>
            <div className="font-mono text-xs font-bold text-[var(--brand-fg)]">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Main Text Area */}
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={7}
          placeholder="Type or paste text/JSON to transform..."
          className="w-full resize-none rounded-xl border border-[var(--brand-border)] bg-[var(--brand-card-bg)] p-4 font-mono text-xs text-[var(--brand-fg)] outline-none focus:border-[var(--brand-accent)]"
        />

        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={copyCurrent}
            className="btn-icon h-7 w-7 rounded bg-[var(--brand-surface-2)] text-[var(--brand-muted)] hover:text-[var(--brand-fg)] shadow-xs"
            title="Copy text"
          >
            {copiedAction === 'copy-raw' ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setInput('')}
            className="btn-icon h-7 w-7 rounded bg-[var(--brand-surface-2)] text-[var(--brand-muted)] hover:text-red-400 shadow-xs"
            title="Clear text"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Action Chips */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-muted)]">
          <Sparkles className="h-3.5 w-3.5 text-[var(--brand-accent)]" />
          1-Click Transformations (Transforms &amp; Copies)
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'camel', label: 'camelCase' },
            { id: 'kebab', label: 'kebab-case' },
            { id: 'snake', label: 'snake_case' },
            { id: 'pascal', label: 'PascalCase' },
            { id: 'upper', label: 'UPPERCASE' },
            { id: 'lower', label: 'lowercase' },
            { id: 'json-prettify', label: 'Prettify JSON' },
            { id: 'json-minify', label: 'Minify JSON' },
          ].map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => applyTransformation(act.id)}
              className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-medium transition-all ${
                copiedAction === act.id
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                  : 'border-[var(--brand-border)] bg-[var(--brand-card-bg)] text-[var(--brand-fg)] hover:border-[var(--brand-accent)] hover:bg-[var(--brand-surface-2)]'
              }`}
            >
              {copiedAction === act.id ? '✓ Copied' : act.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
