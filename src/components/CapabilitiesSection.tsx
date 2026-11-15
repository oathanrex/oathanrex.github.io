import { useState } from 'react';
import { CAPABILITY_GROUPS } from '../data/portfolioData';

export function CapabilitiesSection() {
  const [selectedId, setSelectedId] = useState<string>(CAPABILITY_GROUPS[0].id);

  const activeGroup =
    CAPABILITY_GROUPS.find((group) => group.id === selectedId) || CAPABILITY_GROUPS[0];

  const principles = [
    {
      title: 'Zero-Upload Client Execution',
      detail:
        'Canvas homography, format conversion, speech transcription, and Markdown rendering run locally in the browser.',
    },
    {
      title: 'Static Edge Delivery',
      detail:
        'Published as zero-install static bundles with lean JavaScript payloads and sub-second first paint.',
    },
    {
      title: 'Open-Source Maintainability',
      detail:
        'Typed TypeScript and Python modules designed for quick inspection, forkability, and long-term reliability.',
    },
  ];

  return (
    <section id="capabilities" className="section-shell">
      <div className="layout-container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left: Engineering Standards */}
          <div className="lg:col-span-5">
            <p className="eyebrow-label">Engineering Standards</p>
            <h2 className="section-heading">Built for privacy, clarity, and speed</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--brand-muted)] sm:text-base">
              Every project by Oathan Rex prioritizes zero-latency browser APIs, clean accessibility,
              and dependable open-source engineering.
            </p>

            <div className="mt-7 divide-y divide-[var(--brand-border)] border-t border-b border-[var(--brand-border)]">
              {principles.map((item) => (
                <div key={item.title} className="py-4">
                  <div className="text-sm font-semibold text-[var(--brand-fg)]">
                    {item.title}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--brand-muted)]">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Segmented Stack Matrix */}
          <div className="lg:col-span-7">
            <div
              className="flex flex-wrap gap-1.5 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-well)] p-1.5"
              role="tablist"
              aria-label="Technology capability categories"
            >
              {CAPABILITY_GROUPS.map((group) => {
                const active = group.id === activeGroup.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedId(group.id)}
                    className={`focus-ring min-h-[36px] rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[var(--brand-surface)] text-[var(--brand-fg)] shadow-xs'
                        : 'text-[var(--brand-muted)] hover:bg-[var(--brand-surface)]/60 hover:text-[var(--brand-fg)]'
                    }`}
                  >
                    {group.label}
                  </button>
                );
              })}
            </div>

            <div className="surface-card mt-6 p-6">
              <div className="border-b border-[var(--brand-border-subtle)] pb-4">
                <h3 className="font-display text-lg font-semibold text-[var(--brand-fg)]">
                  {activeGroup.label}
                </h3>
                <p className="mt-1 text-sm text-[var(--brand-muted)]">
                  {activeGroup.summary}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                {activeGroup.items.map((item) => (
                  <div
                    key={item.name}
                    className="border-b border-[var(--brand-border-subtle)] pb-3 last:border-b-0 sm:last:border-b"
                  >
                    <div className="text-sm font-semibold text-[var(--brand-fg)]">
                      {item.name}
                    </div>
                    <div className="mt-0.5 text-xs text-[var(--brand-muted)]">
                      {item.role}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
