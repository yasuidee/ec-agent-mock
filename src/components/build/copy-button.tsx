'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors shrink-0"
    >
      {copied ? <Check size={12} className="text-teal-600" /> : <Copy size={12} />}
      {copied ? 'コピーしました✓' : 'コピー'}
    </button>
  );
}
