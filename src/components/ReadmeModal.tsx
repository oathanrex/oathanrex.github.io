import { ExternalLink, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { OATHANREX_CONTACT } from '../data/portfolioData';
import type { GitHubRepo } from '../types/portfolio';
import { parseSimpleMarkdown } from '../utils/githubLogic';
import { loadRepoReadme } from '../utils/githubService';

interface ReadmeModalProps {
  repo: GitHubRepo;
  onClose: () => void;
}

export function ReadmeModal({ repo, onClose }: ReadmeModalProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setContent('');

    const owner = repo.owner?.login || OATHANREX_CONTACT.handle.replace('@', '');
    loadRepoReadme(repo.name, owner, repo.readmeFallback).then((text) => {
      if (!active) return;
      setContent(text);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [repo]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const blocks = useMemo(() => parseSimpleMarkdown(content), [content]);

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="readme-modal-title"
    >
      <div
        className="modal-panel flex max-h-[85vh] max-w-2xl flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--brand-border)] px-6 py-4">
          <div className="min-w-0">
            <p className="font-mono text-xs text-[var(--brand-muted)]">README.md</p>
            <h3
              id="readme-modal-title"
              className="truncate font-display text-lg font-bold text-[var(--brand-fg)]"
            >
              {repo.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary min-h-[36px] gap-1.5 px-3 py-1.5 text-xs font-medium"
            >
              GitHub
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close README dialog"
              className="btn-icon h-9 w-9 text-[var(--brand-muted)] hover:text-[var(--brand-fg)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-6 py-5 text-sm leading-relaxed text-[var(--brand-muted)]">
          {loading ? (
            <p className="text-[var(--brand-muted)]">Loading repository documentation...</p>
          ) : blocks.length === 0 ? (
            <p className="text-[var(--brand-muted)]">
              No README documentation found for this repository.
            </p>
          ) : (
            <div className="space-y-4">
              {blocks.map((block, index) => {
                if (block.type === 'heading') {
                  if (block.level === 1) {
                    return (
                      <h4
                        key={index}
                        className="font-display text-xl font-bold text-[var(--brand-fg)]"
                      >
                        {block.text}
                      </h4>
                    );
                  }
                  if (block.level === 2) {
                    return (
                      <h5
                        key={index}
                        className="font-display text-base font-semibold text-[var(--brand-fg)]"
                      >
                        {block.text}
                      </h5>
                    );
                  }
                  return (
                    <h6
                      key={index}
                      className="text-sm font-semibold text-[var(--brand-fg)]"
                    >
                      {block.text}
                    </h6>
                  );
                }

                if (block.type === 'code') {
                  return (
                    <pre
                      key={index}
                      className="overflow-x-auto rounded-lg border border-[var(--brand-border)] bg-[var(--brand-well)] p-3.5 font-mono text-xs text-[var(--brand-fg)]"
                    >
                      <code>{block.content}</code>
                    </pre>
                  );
                }

                if (block.type === 'list') {
                  return (
                    <ul key={index} className="list-disc space-y-1.5 pl-5">
                      {block.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  );
                }

                return <p key={index}>{block.text}</p>;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
