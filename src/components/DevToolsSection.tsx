import { Binary, Code2, Hash, Palette, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Base64Studio } from '../tools/Base64Studio';
import { ColorLab } from '../tools/ColorLab';
import { HashUuidGenerator } from '../tools/HashUuidGenerator';
import { TextTransformer } from '../tools/TextTransformer';
import { DEV_TOOLS_CATALOG, type DevToolId } from '../tools/types';

const TOOL_ICONS: Record<DevToolId, React.ComponentType<{ className?: string }>> = {
  base64: Binary,
  color: Palette,
  text: Code2,
  crypto: Hash,
};

export function DevToolsSection() {
  const [activeTool, setActiveTool] = useState<DevToolId>('base64');

  const currentToolMeta = DEV_TOOLS_CATALOG.find((t) => t.id === activeTool) || DEV_TOOLS_CATALOG[0];

  return (
    <section id="tools" className="section-shell--well scroll-mt-20 py-20 lg:py-28">
      <div className="layout-container">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="section-kicker flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--brand-accent)]" />
              <span>Zero-Upload Suite</span>
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--brand-fg)] sm:text-4xl">
              Native Browser Utilities
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--brand-muted)] sm:text-base">
              Client-side developer utilities running on WebCrypto, Canvas, and modern Web APIs.
              Your data never touches a server.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface-2)] px-3.5 py-1.5 text-xs font-semibold text-[var(--brand-accent-ink)]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            100% In-Browser Execution
          </div>
        </div>

        {/* Master Tool Interface */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-card-bg)] shadow-md">
          {/* Tool Navigation Bar */}
          <div className="flex overflow-x-auto border-b border-[var(--brand-border)] bg-[var(--brand-surface-2)]/70 p-2 scrollbar-none">
            <div className="flex gap-2">
              {DEV_TOOLS_CATALOG.map((tool) => {
                const Icon = TOOL_ICONS[tool.id];
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setActiveTool(tool.id)}
                    className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[var(--brand-card-bg)] text-[var(--brand-fg)] shadow-xs ring-1 ring-[var(--brand-border)]'
                        : 'text-[var(--brand-muted)] hover:bg-[var(--brand-card-bg)]/50 hover:text-[var(--brand-fg)]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-[var(--brand-accent)]' : ''}`} />
                    <span>{tool.title}</span>
                    <span
                      className={`hidden sm:inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-[var(--brand-accent)]/15 text-[var(--brand-accent-ink)]'
                          : 'bg-[var(--brand-surface)] text-[var(--brand-muted)]'
                      }`}
                    >
                      {tool.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tool Workspace */}
          <div className="p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--brand-border)]/60 pb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--brand-fg)]">{currentToolMeta.title}</h3>
                <p className="text-xs text-[var(--brand-muted)]">{currentToolMeta.description}</p>
              </div>
            </div>

            {/* Dynamic Tool Renderer */}
            <div>
              {activeTool === 'base64' && <Base64Studio />}
              {activeTool === 'color' && <ColorLab />}
              {activeTool === 'text' && <TextTransformer />}
              {activeTool === 'crypto' && <HashUuidGenerator />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
