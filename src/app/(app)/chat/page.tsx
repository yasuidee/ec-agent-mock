'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { Input } from '@/components/ui/input';

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].filter((m) => m !== INITIAL_MESSAGE);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data: Message = await res.json();
      setMessages((prev) => [...prev, data]);
    } catch {
      setMessages((prev) => [
        ...prev,
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
      <aside className="col-span-1 bg-white border-r flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b">
          <h2 className="text-sm font-semibold text-slate-700">チャット履歴</h2>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {HISTORY.map((q) => (
            <li key={q}>
              <button
                onClick={() => sendMessage(q)}
                className="w-full text-left border-b py-3 px-4 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* ── Main chat area ────────────────────────────────── */}
      <div className="col-span-3 flex flex-col overflow-hidden bg-slate-50">
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
                className={`max-w-[72%] rounded-lg px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-900 text-white'
                    : 'bg-white border text-slate-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-end gap-2 justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center shrink-0 mb-0.5">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white border rounded-lg px-4 py-2">
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
        <div className="border-t p-4 bg-white">
          {/* Quick questions */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="text-xs border border-slate-300 text-slate-600 rounded-md px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Text input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="質問を入力してください..."
              disabled={loading}
              className="flex-1"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
