'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Send, Bot, Plus, Search, Pin, ArrowRight,
  Paperclip, Mic, MoreHorizontal, ThumbsUp, ThumbsDown,
  ClipboardList, RefreshCw,
} from 'lucide-react';
import {
  mockChatHistory,
  mockSnapshotCards,
  mockCategoryCards,
  mockQuickChips,
} from '@/lib/chat-data/mock';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Static initial message ───────────────────────────────────────────────────

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content:
    'こんにちは、やすさん。EC Agentです。\n今日の売上は¥187,400で前日比+12.3%です。\n在庫・広告・商品ページについて何でも聞いてください。',
};

// ─── Chat history panel ───────────────────────────────────────────────────────

function ChatHistoryPanel({
  onSelectQuestion,
  loading,
}: {
  onSelectQuestion: (q: string) => void;
  loading: boolean;
}) {
  const [search, setSearch] = useState('');

  const GroupLabel = ({ label }: { label: string }) => (
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-4 mb-1.5 px-3">
      {label}
    </p>
  );

  const HistoryItem = ({
    title,
    preview,
    pinned,
    active,
    question,
  }: {
    title: string;
    preview: string;
    pinned?: boolean;
    active?: boolean;
    question: string;
  }) => (
    <button
      onClick={() => onSelectQuestion(question)}
      disabled={loading}
      className={`w-full text-left rounded-lg px-3 py-2.5 cursor-pointer transition-colors disabled:opacity-50 ${
        active
          ? 'bg-blue-50 border border-blue-900/30'
          : 'hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-1.5">
        {pinned && <Pin size={10} className="text-slate-400 shrink-0" />}
        <span
          className={`text-sm font-medium truncate ${
            active ? 'text-blue-900 font-semibold' : 'text-slate-900'
          }`}
        >
          {title}
        </span>
      </div>
      <p className="text-[11px] text-slate-400 truncate mt-0.5">{preview}</p>
    </button>
  );

  return (
    <div className="w-[280px] shrink-0 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-6 pb-3 shrink-0">
        <h2 className="text-base font-bold text-slate-900 mb-4">チャット履歴</h2>

        {/* New chat button */}
        <button
          onClick={() => onSelectQuestion('')}
          className="w-full h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center gap-2 text-sm font-semibold hover:bg-blue-950 transition-colors"
        >
          <Plus size={16} />
          新しいチャット
        </button>

        {/* Search */}
        <div className="mt-3 flex items-center gap-2 bg-slate-100 rounded-lg px-3 h-9">
          <Search size={13} className="text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="履歴を検索..."
            className="flex-1 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {/* Pinned */}
        <GroupLabel label="ピン留め" />
        <div className="space-y-0.5">
          {mockChatHistory.pinned.map((item) => (
            <HistoryItem key={item.id} {...item} question={item.title} />
          ))}
        </div>

        {/* Today */}
        <GroupLabel label="今日" />
        <div className="space-y-0.5">
          {mockChatHistory.today.map((item) => (
            <HistoryItem key={item.id} {...item} question={item.title} />
          ))}
        </div>

        {/* Yesterday */}
        <GroupLabel label="昨日" />
        <div className="space-y-0.5">
          {mockChatHistory.yesterday.map((item) => (
            <HistoryItem key={item.id} {...item} question={item.title} />
          ))}
        </div>

        {/* This week */}
        <GroupLabel label="今週" />
        <div className="space-y-0.5">
          {mockChatHistory.thisWeek.map((item) => (
            <HistoryItem key={item.id} {...item} question={item.title} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Top bar ──────────────────────────────────────────────────────────────────

function ChatTopBar() {
  return (
    <div
      className="bg-white border-b border-slate-200 flex items-center px-7 gap-3 shrink-0"
      style={{ height: 72 }}
    >
      {/* AI avatar + info */}
      <div className="w-11 h-11 rounded-xl bg-blue-900 flex items-center justify-center shrink-0">
        <Bot size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-900">EC Agent</span>
          <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
            オンライン
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">
          あなたのECデータを学習済み · リアルタイム参照
        </p>
      </div>

      {/* Right side badges */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="bg-blue-50 text-blue-900 text-xs font-semibold px-3 py-2 rounded-lg hidden md:block">
          ⚡ Amazon・楽天 連携中
        </span>
        <button
          className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          aria-label="メニューを開く"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Greeting bubble (initial AI message with snapshots) ─────────────────────

function GreetingBubble({ onSend }: { onSend: (q: string) => void }) {
  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-lg bg-blue-900 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-base">🤖</span>
      </div>

      {/* Bubble */}
      <div className="max-w-[640px] bg-white rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm px-5 py-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-900">EC Agent</span>
          <span className="text-[11px] text-slate-400">· 9:24</span>
        </div>

        {/* Body */}
        <p className="text-sm text-slate-900 leading-relaxed">
          おはようございます、やすさん 👋<br />
          今日の売上は <span className="font-bold">¥187,400</span> で前日比 <span className="font-bold text-emerald-600">+12.3%</span> です。<br />
          在庫・広告・商品ページについて、何でも聞いてください。
        </p>

        {/* Snapshot cards */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {mockSnapshotCards.map((card) => (
            <div
              key={card.label}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base">{card.emoji}</span>
                <span className="text-[11px] text-slate-500 font-medium">{card.label}</span>
              </div>
              <p className={`text-lg font-bold ${card.colorClass}`}>{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Suggestion category cards ────────────────────────────────────────────────

function SuggestionCards({ onSend }: { onSend: (q: string) => void }) {
  return (
    <div className="mt-8">
      <p className="text-base font-bold text-slate-900 mb-1">
        ✨ 今日はどんなことを聞きますか?
      </p>
      <p className="text-xs text-slate-500 mb-4">
        よくある相談カテゴリ。クリックで会話が始まります。
      </p>
      <div className="grid grid-cols-2 gap-3">
        {mockCategoryCards.map((card) => (
          <button
            key={card.title}
            onClick={() => onSend(card.question)}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow text-left flex items-start"
          >
            <div
              className={`w-11 h-11 rounded-lg ${card.bgClass} flex items-center justify-center shrink-0 text-xl`}
            >
              {card.emoji}
            </div>
            <div className="flex-1 ml-3 min-w-0">
              <p className="text-sm font-bold text-slate-900">{card.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.desc}</p>
              <p className={`text-[11px] font-medium mt-1 ${card.sampleColor}`}>
                &ldquo;{card.sample}&rdquo;
              </p>
            </div>
            <ArrowRight size={16} className="text-slate-400 shrink-0 mt-1 ml-1" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── User message bubble ──────────────────────────────────────────────────────

function UserBubble({ content, time }: { content: string; time?: string }) {
  return (
    <div className="flex justify-end mt-6">
      <div className="max-w-[60%]">
        <div className="bg-blue-900 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 inline-block">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
        {time && (
          <p className="text-[10px] text-slate-400 text-right mt-1">{time} ✓✓</p>
        )}
      </div>
    </div>
  );
}

// ─── AI message bubble ────────────────────────────────────────────────────────

function AIBubble({
  content,
  time,
  streaming,
}: {
  content: string;
  time?: string;
  streaming?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 mt-4">
      <div className="w-9 h-9 rounded-lg bg-blue-900 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-base">🤖</span>
      </div>
      <div className="max-w-[640px] bg-white rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm px-5 py-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-blue-900">EC Agent</span>
          {time && <span className="text-[11px] text-slate-400">· {time}</span>}
        </div>
        <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">
          {content}
          {streaming && content.length > 0 && (
            <span className="inline-block w-0.5 h-3.5 bg-slate-400 ml-0.5 animate-pulse align-middle" />
          )}
        </p>
        {/* Feedback row (shown when not streaming) */}
        {!streaming && content.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            {[
              { icon: ThumbsUp,     label: '参考になった' },
              { icon: ThumbsDown,   label: '参考にならなかった' },
              { icon: ClipboardList, label: 'コピー' },
              { icon: RefreshCw,    label: '再生成' },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                aria-label={label}
                className="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"
              >
                <Icon size={13} />
              </button>
            ))}
            <span className="ml-auto text-[11px] text-slate-400">回答に満足しましたか?</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 mt-4">
      <div className="w-9 h-9 rounded-lg bg-blue-900 flex items-center justify-center shrink-0">
        <span className="text-base">🤖</span>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
        <span className="flex gap-1.5">
          {[0, 1, 2].map((n) => (
            <span
              key={n}
              className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
              style={{ animationDelay: `${n * 0.15}s` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

// ─── Input area ───────────────────────────────────────────────────────────────

function ChatInputArea({
  input,
  setInput,
  onSubmit,
  onQuickSend,
  loading,
}: {
  input: string;
  setInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onQuickSend: (q: string) => void;
  loading: boolean;
}) {
  return (
    <div className="bg-white border-t border-slate-200 px-7 py-4 shrink-0">
      {/* Quick suggest chips */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {mockQuickChips.map((chip) => (
          <button
            key={chip.label}
            onClick={() => onQuickSend(chip.question)}
            disabled={loading}
            className="bg-slate-100 rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 cursor-pointer hover:bg-slate-200 disabled:opacity-50 transition-colors"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input box */}
      <form onSubmit={onSubmit}>
        <div
          className="flex items-center gap-2.5 bg-white border-2 border-blue-900 rounded-2xl px-4"
          style={{
            height: 56,
            boxShadow: '0 4px 12px rgba(30,58,138,0.10)',
          }}
        >
          {/* Attach */}
          <button
            type="button"
            aria-label="ファイルを添付"
            className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors shrink-0"
          >
            <Paperclip size={15} />
          </button>

          {/* Text input */}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ECに関する質問を入力... (例: 今月の売上目標達成には?)"
            disabled={loading}
            className="flex-1 bg-transparent text-sm placeholder:text-slate-400 focus:outline-none disabled:opacity-50 min-w-0"
          />

          {/* Voice */}
          <button
            type="button"
            aria-label="音声入力"
            className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors shrink-0"
          >
            <Mic size={15} />
          </button>

          {/* Send */}
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="送信"
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: '#f59e0b',
              boxShadow: '0 4px 8px rgba(245,158,11,0.3)',
            }}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin block" />
            ) : (
              <Send size={18} className="text-white" />
            )}
          </button>
        </div>
      </form>

      {/* Hint */}
      <p className="text-[10px] text-slate-400 mt-2">
        ⌘ + Enter で送信 · データはAmazon・楽天と連携中（リアルタイム）
      </p>
    </div>
  );
}

// ─── Main ChatInner ───────────────────────────────────────────────────────────

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

    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setInput('');
    setLoading(true);

    try {
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
        {
          role: 'assistant',
          content: '申し訳ありません。エラーが発生しました。もう一度お試しください。',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Conversation mode starts when there's more than the initial greeting
  const hasConversation = messages.length > 1;

  // Real messages (excluding initial greeting)
  const realMessages = messages.filter((m) => m !== INITIAL_MESSAGE);

  const isStreaming =
    loading && messages[messages.length - 1]?.content !== undefined;
  const isTyping = loading && messages[messages.length - 1]?.content === '';

  return (
    <div className="flex h-full animate-in fade-in duration-300">
      {/* ── Chat history panel ── */}
      <ChatHistoryPanel onSelectQuestion={sendMessage} loading={loading} />

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        <ChatTopBar />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          {/* Date divider */}
          <div className="flex justify-center mb-6">
            <span className="bg-white border border-slate-200 rounded-full px-3.5 py-1 text-[11px] font-semibold text-slate-500">
              2026年5月19日 · 今日
            </span>
          </div>

          {/* Always show greeting bubble */}
          <GreetingBubble onSend={sendMessage} />

          {/* Show suggestion cards only if no conversation yet */}
          {!hasConversation && <SuggestionCards onSend={sendMessage} />}

          {/* Conversation messages */}
          {hasConversation &&
            realMessages.map((msg, i) => {
              if (msg.role === 'user') {
                return <UserBubble key={i} content={msg.content} time="9:25" />;
              }
              // assistant
              const isLastMsg = i === realMessages.length - 1;
              return (
                <AIBubble
                  key={i}
                  content={msg.content}
                  time="9:25"
                  streaming={isLastMsg && isStreaming && !isTyping}
                />
              );
            })}

          {/* Typing indicator */}
          {isTyping && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>

        <ChatInputArea
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          onQuickSend={sendMessage}
          loading={loading}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full bg-white">
          <div className="w-[280px] border-r border-slate-200 bg-white" />
          <div className="flex-1 bg-slate-50" />
        </div>
      }
    >
      <ChatInner />
    </Suspense>
  );
}
