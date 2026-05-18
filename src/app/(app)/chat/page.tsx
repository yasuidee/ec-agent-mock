'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Bot } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content:
    'こんにちは、やすさん。EC Agentです。\n今日の売上は¥187,400で前日比+12.3%です。\n在庫・広告・商品ページについて何でも聞いてください。',
};

const HISTORY = [
  '今週のセール戦略を教えて',
  '在庫切れリスクは？',
  '広告予算の最適配分は？',
];

const QUICK_QUESTIONS = [
  '今週のセール戦略は？',
  '在庫切れリスクを教えて',
  '広告予算の最適化を提案して',
];

// ─── Chat inner (needs useSearchParams → wrapped in Suspense) ─────────────────

function ChatInner() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const autoSentRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-send query from dashboard navigation
  useEffect(() => {
    const action = searchParams.get('action');
    if (action && !autoSentRef.current) {
      autoSentRef.current = true;
      sendMessage(`「${action}」について詳しく教えてください`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };

    // Append user message + empty assistant placeholder for streaming
    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setInput('');
    setLoading(true);

    try {
      // Build history: real messages (no initial greeting) + new user msg, capped at last 6 (3 exchanges)
      const realMessages = [...messages.filter((m) => m !== INITIAL_MESSAGE), userMsg];
      const historyToSend = realMessages.slice(-6);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyToSend }),
      });

      if (!res.body) throw new Error('no stream body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: '申し訳ありません。エラーが発生しました。もう一度お試しください。' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="grid grid-cols-4 h-full -m-8 animate-in fade-in duration-300">
      {/* ── Left sidebar ──────────────────────────────────── */}
      <aside className="col-span-1 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-700">チャット履歴</h2>
        </div>
        <ul className="flex-1 overflow-y-auto p-2 space-y-1">
          {HISTORY.map((q) => (
            <li key={q}>
              <button
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="w-full text-left hover:bg-slate-50 rounded-lg px-3 py-3 text-sm text-slate-600 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* ── Main chat area ────────────────────────────────── */}
      <div className="col-span-3 flex flex-col overflow-hidden bg-slate-50">
        {/* Header */}
        <div className="bg-white px-6 pt-6 shrink-0">
          <PageHeader
            title="AIチャット"
            description="EC運営の悩みをAIに何でも相談できます"
          />
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center shrink-0 mb-0.5">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              <div
                className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-900 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-lg ml-auto'
                    : 'bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 max-w-xl shadow-sm'
                }`}
              >
                {msg.content}
                {/* Blinking cursor while streaming */}
                {msg.role === 'assistant' &&
                  loading &&
                  i === messages.length - 1 &&
                  msg.content.length > 0 && (
                    <span className="inline-block w-0.5 h-3.5 bg-slate-400 ml-0.5 animate-pulse align-middle" />
                  )}
              </div>
            </div>
          ))}

          {/* Typing indicator (before streaming starts) */}
          {loading && messages[messages.length - 1]?.content === '' && (
            <div className="flex items-end gap-2 justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center shrink-0 mb-0.5">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <span className="flex gap-1">
                  {[0, 1, 2].map((n) => (
                    <span
                      key={n}
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${n * 0.15}s` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="bg-white border-t border-slate-200 p-4">
          <div className="flex gap-2 mb-3 flex-wrap">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="border border-slate-200 rounded-full text-xs text-slate-600 px-3 py-1.5 hover:bg-slate-50 hover:border-blue-200 disabled:opacity-50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="質問を入力してください..."
              disabled={loading}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-blue-900 text-white p-2.5 rounded-xl hover:bg-blue-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Page (Suspense wrapper required for useSearchParams) ─────────────────────

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-full -m-8 bg-slate-50" />}>
      <ChatInner />
    </Suspense>
  );
}
