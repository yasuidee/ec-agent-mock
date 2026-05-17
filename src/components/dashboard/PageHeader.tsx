import React from 'react';

type PageHeaderProps = {
  title: string;
  description: string;
  backLink?: boolean;
  actions?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  backLink = true,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-6 pb-6 border-b">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        {backLink && (
          <a
            href="/dashboard"
            className="text-sm text-blue-900 hover:underline shrink-0"
          >
            ← ダッシュボードに戻る
          </a>
        )}
      </div>
    </div>
  );
}
