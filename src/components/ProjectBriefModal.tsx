import { Check, Copy, Mail, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { buildProjectBriefMailto, buildProjectBriefText } from '../utils/githubLogic';

interface ProjectBriefModalProps {
  open: boolean;
  onClose: () => void;
}

const SCOPES = [
  'Full-Stack Web Product',
  'UI/UX Architecture & Design System',
  'Performance & Core Web Vitals Audit',
  'Developer Tooling / Automation',
];

const TIMELINES = ['Immediate (< 2 weeks)', '2-4 Weeks', '1-2 Months', 'Flexible'];

const PROJECT_STAGES = [
  {
    id: 'discovery',
    label: 'Discovery',
    detail: 'Scope alignment, constraints & architecture brief',
  },
  {
    id: 'architecture',
    label: 'Architecture',
    detail: 'Data flow, UI primitives & performance budget',
  },
  {
    id: 'build',
    label: 'Core Build',
    detail: 'Zero-upload execution, APIs & automated tests',
  },
  {
    id: 'launch',
    label: 'QA & Launch',
    detail: 'Core Web Vitals pass, edge deploy & handoff',
  },
] as const;

export function ProjectBriefModal({ open, onClose }: ProjectBriefModalProps) {
  const [scope, setScope] = useState(SCOPES[0]);
  const [timeline, setTimeline] = useState(TIMELINES[1]);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [activeTimeline, setActiveTimeline] = useState('');
  const [showStagePreview, setShowStagePreview] = useState(true);
  const [senderEmail, setSenderEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const currentStage = PROJECT_STAGES[activeStageIndex];
  const briefInput = {
    scope,
    timeline,
    activeStage: showStagePreview ? currentStage.label : undefined,
    activeTimeline: activeTimeline.trim() || undefined,
    senderEmail,
    notes,
  };
  const mailtoHref = buildProjectBriefMailto(briefInput);

  const handleCopyBrief = () => {
    navigator.clipboard
      .writeText(buildProjectBriefText(briefInput))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="modal-backdrop"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="brief-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="modal-panel max-h-[92vh] max-w-xl overflow-y-auto p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[var(--brand-accent-ink)]">
                  Start a Conversation
                </p>
                <h3
                  id="brief-modal-title"
                  className="mt-1 font-display text-2xl font-bold tracking-tight text-[var(--brand-fg)]"
                >
                  Quick Project Brief
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close project brief dialog"
                className="btn-icon h-10 w-10 text-[var(--brand-muted)] hover:text-[var(--brand-fg)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <span className="block text-xs font-semibold text-[var(--brand-fg)]">
                  Engagement Scope
                </span>
                <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {SCOPES.map((option) => {
                    const active = scope === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setScope(option)}
                        className={`focus-ring rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                          active
                            ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent-ink)]'
                            : 'border-[var(--brand-border)] text-[var(--brand-fg)] hover:bg-[var(--brand-well)]'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-[var(--brand-fg)]">
                  Target Timeline
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TIMELINES.map((option) => {
                    const active = timeline === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setTimeline(option)}
                        className={`focus-ring rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          active
                            ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-[var(--brand-accent-fg)] hover:bg-[var(--brand-accent-hover)]'
                            : 'border-[var(--brand-border)] text-[var(--brand-fg)] hover:bg-[var(--brand-well)]'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Active Project Timeline & Interactive Stage Visualizer */}
              <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-well)]/70 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="active-project-timeline"
                    className="block text-xs font-semibold text-[var(--brand-fg)]"
                  >
                    Timeline for Active Project (optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowStagePreview((prev) => !prev)}
                    aria-expanded={showStagePreview}
                    className="focus-ring rounded text-xs font-semibold text-[var(--brand-accent-ink)] underline-offset-4 hover:underline"
                  >
                    {showStagePreview ? 'Hide stages' : 'Visualize stages'}
                  </button>
                </div>

                <input
                  id="active-project-timeline"
                  type="text"
                  value={activeTimeline}
                  onChange={(e) => setActiveTimeline(e.target.value)}
                  placeholder="e.g. Milestone 2 · Beta ready Nov 28"
                  className="form-field mt-2 h-9 px-3 text-xs"
                />

                {showStagePreview && (
                  <div className="mt-3" aria-label="Active project stages">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--brand-border)]">
                      <motion.div
                        className="h-full rounded-full bg-[var(--brand-accent)]"
                        initial={false}
                        animate={{
                          width: `${((activeStageIndex + 1) / PROJECT_STAGES.length) * 100}%`,
                        }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                      {PROJECT_STAGES.map((stage, idx) => {
                        const isSelected = idx === activeStageIndex;
                        const isCompleted = idx < activeStageIndex;
                        return (
                          <button
                            key={stage.id}
                            type="button"
                            onClick={() => setActiveStageIndex(idx)}
                            aria-pressed={isSelected}
                            className={`focus-ring rounded-lg border px-2.5 py-2 text-left transition-colors ${
                              isSelected
                                ? 'border-[var(--brand-accent)] bg-[var(--brand-surface)] text-[var(--brand-fg)] shadow-xs'
                                : isCompleted
                                  ? 'border-[var(--brand-accent)]/45 bg-[var(--brand-accent-soft)] text-[var(--brand-accent-ink)]'
                                  : 'border-[var(--brand-border)] bg-transparent text-[var(--brand-muted)] hover:bg-[var(--brand-surface)] hover:text-[var(--brand-fg)]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 font-mono text-[10px] uppercase tracking-wide">
                              <span>0{idx + 1}</span>
                              {isSelected && (
                                <span className="font-semibold text-[var(--brand-accent-ink)]">Active</span>
                              )}
                            </div>
                            <div className="mt-0.5 truncate text-xs font-semibold">
                              {stage.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-2 text-xs text-[var(--brand-muted)]">
                      <span className="font-medium text-[var(--brand-fg)]">
                        Stage {activeStageIndex + 1} ({currentStage.label}):
                      </span>{' '}
                      {currentStage.detail}
                      {activeTimeline.trim() ? ` · Target: ${activeTimeline.trim()}` : ''}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="brief-email"
                  className="block text-xs font-semibold text-[var(--brand-fg)]"
                >
                  Your Email (optional)
                </label>
                <input
                  id="brief-email"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="form-field mt-1.5 h-10 bg-[var(--brand-bg)] px-3 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="brief-notes"
                  className="block text-xs font-semibold text-[var(--brand-fg)]"
                >
                  Goals or Technical Context
                </label>
                <textarea
                  id="brief-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell me what you're building, key deadlines, or links..."
                  className="form-field mt-1.5 bg-[var(--brand-bg)] p-2.5 text-sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-[var(--brand-border)] pt-3.5">
                <a
                  href={mailtoHref}
                  onClick={onClose}
                  className="btn-primary min-h-[42px] flex-1 px-4 py-2 text-sm"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Open in Email Client
                </a>

                <button
                  type="button"
                  onClick={handleCopyBrief}
                  className="btn-secondary min-h-[42px] px-4 py-2 text-sm font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-[var(--brand-accent-ink)]" aria-hidden="true" />
                      Copied Brief
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" aria-hidden="true" />
                      Copy Brief
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
