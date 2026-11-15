import { Check, Copy, Download, FileUp, RefreshCw, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';

export function Base64Studio() {
  const [tab, setTab] = useState<'text' | 'file'>('text');
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode');
  const [textInput, setTextInput] = useState('Hello, Oathan Rex DevSuite!');
  const [copied, setCopied] = useState(false);
  const [fileData, setFileData] = useState<{
    name: string;
    type: string;
    size: number;
    dataUrl: string;
  } | null>(null);

  // Compute text conversion
  let textOutput = '';
  let textError = '';
  if (tab === 'text') {
    try {
      if (direction === 'encode') {
        textOutput = btoa(unescape(encodeURIComponent(textInput)));
      } else {
        textOutput = decodeURIComponent(escape(atob(textInput.trim())));
      }
    } catch {
      textError = 'Invalid string for Base64 conversion.';
    }
  }

  const handleCopy = (str: string) => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFileData({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--brand-border)] pb-4">
        <div className="inline-flex rounded-lg bg-[var(--brand-surface-2)] p-1 ring-1 ring-[var(--brand-border)]">
          <button
            type="button"
            onClick={() => setTab('text')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
              tab === 'text'
                ? 'bg-[var(--brand-card-bg)] text-[var(--brand-fg)] shadow-xs'
                : 'text-[var(--brand-muted)] hover:text-[var(--brand-fg)]'
            }`}
          >
            Text Mode
          </button>
          <button
            type="button"
            onClick={() => setTab('file')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
              tab === 'file'
                ? 'bg-[var(--brand-card-bg)] text-[var(--brand-fg)] shadow-xs'
                : 'text-[var(--brand-muted)] hover:text-[var(--brand-fg)]'
            }`}
          >
            Image &amp; File Mode
          </button>
        </div>

        {tab === 'text' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDirection((prev) => (prev === 'encode' ? 'decode' : 'encode'));
                setTextInput(textOutput || '');
              }}
              className="btn-secondary text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Swap ({direction === 'encode' ? 'Encode' : 'Decode'})
            </button>
            <button
              type="button"
              onClick={() => setTextInput('')}
              className="btn-icon h-8 w-8 text-[var(--brand-muted)] hover:text-[var(--brand-fg)]"
              title="Clear input"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {tab === 'text' ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Input Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-muted)]">
              Input ({direction === 'encode' ? 'Plain Text' : 'Base64 String'})
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={8}
              placeholder={direction === 'encode' ? 'Type or paste plain text...' : 'Paste Base64 string...'}
              className="w-full resize-none rounded-xl border border-[var(--brand-border)] bg-[var(--brand-card-bg)] p-3 font-mono text-xs text-[var(--brand-fg)] outline-none transition-colors focus:border-[var(--brand-accent)]"
            />
          </div>

          {/* Output Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-muted)]">
                Output ({direction === 'encode' ? 'Base64 String' : 'Decoded Text'})
              </label>
              {textOutput && (
                <button
                  type="button"
                  onClick={() => handleCopy(textOutput)}
                  className="btn-primary text-xs py-1 px-2.5 h-auto"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
            <textarea
              readOnly
              value={textError || textOutput}
              rows={8}
              className={`w-full resize-none rounded-xl border bg-[var(--brand-surface-2)] p-3 font-mono text-xs outline-none ${
                textError
                  ? 'border-red-500/40 text-red-400'
                  : 'border-[var(--brand-border)] text-[var(--brand-fg)]'
              }`}
            />
          </div>
        </div>
      ) : (
        /* File Mode */
        <div className="space-y-6">
          <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--brand-border)] bg-[var(--brand-card-bg)]/60 p-8 text-center transition-colors hover:border-[var(--brand-accent)] hover:bg-[var(--brand-card-bg)]">
            <FileUp className="h-8 w-8 text-[var(--brand-accent)] transition-transform group-hover:scale-110" />
            <span className="mt-3 text-sm font-semibold text-[var(--brand-fg)]">
              Drop any file or image to convert to Base64
            </span>
            <span className="mt-1 font-mono text-xs text-[var(--brand-muted)]">
              100% processed locally in your browser. Zero server upload.
            </span>
            <input type="file" onChange={handleFileChange} className="hidden" />
          </label>

          {fileData && (
            <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-[var(--brand-fg)]">{fileData.name}</div>
                  <div className="font-mono text-xs text-[var(--brand-muted)]">
                    {fileData.type} • {(fileData.size / 1024).toFixed(1)} KB
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(fileData.dataUrl)}
                    className="btn-primary text-xs"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied Data URL' : 'Copy Data URL'}
                  </button>
                  <a
                    href={fileData.dataUrl}
                    download={fileData.name}
                    className="btn-secondary text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </div>
              </div>

              {/* Preview if Image */}
              {fileData.type.startsWith('image/') && (
                <div className="flex justify-center rounded-lg border border-[var(--brand-border)] bg-[var(--brand-bg)] p-4">
                  <img
                    src={fileData.dataUrl}
                    alt={fileData.name}
                    className="max-h-48 rounded object-contain shadow-xs"
                  />
                </div>
              )}

              {/* Data URL preview */}
              <div className="space-y-1">
                <span className="font-mono text-xs text-[var(--brand-muted)]">Base64 Snippet:</span>
                <textarea
                  readOnly
                  rows={3}
                  value={fileData.dataUrl}
                  className="w-full resize-none rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-2)] p-2.5 font-mono text-xs text-[var(--brand-fg)]"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
