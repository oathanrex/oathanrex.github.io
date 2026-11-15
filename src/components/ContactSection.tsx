import { ArrowRight, Check, Coffee, Copy, ExternalLink, Mail } from 'lucide-react';
import { useState } from 'react';
import { OATHANREX_CONTACT } from '../data/portfolioData';

interface ContactSectionProps {
  onOpenProjectBrief: () => void;
}

export function ContactSection({ onOpenProjectBrief }: ContactSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(OATHANREX_CONTACT.email)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  return (
    <section id="contact" className="section-shell--end">
      <div className="layout-container">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="eyebrow-label">Contact</p>
            <h2 className="section-heading">Work with Oathan Rex</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--brand-muted)] sm:text-base">
              Open to engineering collaborations, high-speed browser tool builds, and open-source
              partnerships. Reach out directly by email or send a structured project note.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${OATHANREX_CONTACT.email}`}
                className="btn-primary min-h-[44px] px-5 py-2.5 text-sm"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email {OATHANREX_CONTACT.email}
              </a>

              <button
                type="button"
                onClick={onOpenProjectBrief}
                className="btn-secondary min-h-[44px] px-5 py-2.5 text-sm"
              >
                Send Project Brief
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="btn-ghost min-h-[44px] px-3.5 py-2.5 text-sm"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-[var(--brand-accent-ink)]" aria-hidden="true" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    Copy Email
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="surface-panel divide-y divide-[var(--brand-border)] overflow-hidden">
              <a
                href={OATHANREX_CONTACT.website}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring group flex items-center justify-between p-5 transition-colors hover:bg-[var(--brand-well)]/70"
              >
                <div>
                  <div className="text-sm font-semibold text-[var(--brand-fg)] group-hover:text-[var(--brand-accent-ink)]">
                    PerspectiveFix
                  </div>
                  <div className="mt-0.5 text-xs text-[var(--brand-muted)]">
                    perspectivefix.app · Flagship Browser Scanner
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-[var(--brand-muted)] transition-colors group-hover:text-[var(--brand-fg)]" aria-hidden="true" />
              </a>

              <a
                href={OATHANREX_CONTACT.github}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring group flex items-center justify-between p-5 transition-colors hover:bg-[var(--brand-well)]/70"
              >
                <div>
                  <div className="text-sm font-semibold text-[var(--brand-fg)] group-hover:text-[var(--brand-accent-ink)]">
                    GitHub
                  </div>
                  <div className="mt-0.5 text-xs text-[var(--brand-muted)]">
                    @oathanrex · Open-Source Software &amp; Tools
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-[var(--brand-muted)] transition-colors group-hover:text-[var(--brand-fg)]" aria-hidden="true" />
              </a>

              <a
                href={OATHANREX_CONTACT.codepen}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring group flex items-center justify-between p-5 transition-colors hover:bg-[var(--brand-well)]/70"
              >
                <div>
                  <div className="text-sm font-semibold text-[var(--brand-fg)] group-hover:text-[var(--brand-accent-ink)]">
                    CodePen
                  </div>
                  <div className="mt-0.5 text-xs text-[var(--brand-muted)]">
                    @OathanRex · UI &amp; CSS Experiments
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-[var(--brand-muted)] transition-colors group-hover:text-[var(--brand-fg)]" aria-hidden="true" />
              </a>

              <a
                href={OATHANREX_CONTACT.buyMeACoffee}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring group flex items-center justify-between p-5 transition-colors hover:bg-[var(--brand-well)]/70"
              >
                <div className="flex items-center gap-3">
                  <Coffee className="h-4 w-4 text-[var(--brand-amber)]" aria-hidden="true" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--brand-fg)] group-hover:text-[var(--brand-accent-ink)]">
                      Support Open Source
                    </div>
                    <div className="mt-0.5 text-xs text-[var(--brand-muted)]">
                      Buy Me a Coffee · @oathanrex
                    </div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-[var(--brand-muted)] transition-colors group-hover:text-[var(--brand-fg)]" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
