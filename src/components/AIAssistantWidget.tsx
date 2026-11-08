import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  ExternalLink, 
  RotateCcw, 
  Globe, 
  CheckCircle2, 
  Gamepad2, 
  Search,
  MessageCircle
} from 'lucide-react';

interface SearchSource {
  title: string;
  uri: string;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  searchSources?: SearchSource[];
}

const QUICK_QUESTIONS = [
  '🔍 Live Steam price for Black Myth Wukong?',
  '🎮 Recommend best open world game under ₹499',
  '⚡ How does WhatsApp automated key delivery work?',
  '🚀 Can a GTX 1650 run Cyberpunk 2077 smoothly?',
  '🛡️ Is Steam Offline activation safe for lifetime?'
];

export const AIAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hey gamer! ⚡ I am AAA Cyber AI, backed by Google Gemini with live Google Search data.\n\nAsk me about live Steam deals, PC compatibility benchmarks, game recommendations, or instant WhatsApp key delivery (+91 9442964232)!',
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        sender: 'ai',
        text: 'Chat history cleared. How can I assist your gaming setup today?',
        time: 'Just now'
      }
    ]);
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Keep conversation history (exclude welcome and empty)
    const historyPayload = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({
        role: m.sender === 'ai' ? 'model' : 'user',
        text: m.text
      }));

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: textToSend.trim(),
          conversationHistory: historyPayload
        })
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: data.reply || 'Check out our deals page for the best discounts today!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        searchSources: Array.isArray(data.searchSources) && data.searchSources.length > 0 ? data.searchSources : undefined
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: 'ai_fallback_' + Date.now(),
        sender: 'ai',
        text: '🔥 Top Recommendations: Black Myth: Wukong (₹499) and GTA V Premium (₹299) are today\'s most popular Steam titles with instant WhatsApp key delivery (+91 9442964232)!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
          title="Ask AAA Cyber AI Assistant with Google Search"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-zinc-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-zinc-950 rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-ping" />
            </span>
          </div>
          <span className="text-xs font-black hidden sm:inline tracking-wider uppercase">
            AAA Cyber AI
          </span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-950 text-emerald-400 text-[10px] font-extrabold hidden md:inline">
            SEARCH GROUNDED
          </span>
        </button>
      </div>

      {/* Slide-in AI Dialog */}
      {isOpen && (
        <div className="fixed bottom-24 left-4 sm:left-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] max-h-[600px] h-[550px] bg-zinc-950 border border-emerald-500/40 rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-white animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Top Header */}
          <div className="p-4 bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-white">AAA Cyber AI</h4>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                    <Globe className="w-2.5 h-2.5" />
                    LIVE SEARCH
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono">Gemini 3.8 Flash • Real-time Gaming Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reset conversation"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 font-sans text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-medium rounded-br-none shadow-md'
                      : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {/* Google Search Grounding Sources / Badges */}
                  {m.searchSources && m.searchSources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-800/80">
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mb-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Verified with Google Search:</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {m.searchSources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 truncate"
                          >
                            <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="truncate">{source.title || source.uri}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-zinc-500 mt-1 px-1">{m.time}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-zinc-400 text-xs py-2 bg-zinc-900/60 px-3.5 rounded-xl border border-zinc-800/60 w-fit">
                <Search className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span className="text-[11px] font-mono text-zinc-300">Searching Google &amp; Game Database...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 border-t border-zinc-800/80 bg-zinc-900/40 overflow-x-auto no-scrollbar flex items-center gap-1.5">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-[10px] text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* WhatsApp Direct Help Banner */}
          <div className="px-3 py-1.5 bg-emerald-950/40 border-t border-emerald-900/40 flex items-center justify-between text-[10px] text-emerald-300">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3 text-emerald-400" />
              Store WhatsApp: <strong>+91 9442964232</strong>
            </span>
            <a
              href="https://wa.me/919442964232"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 font-bold hover:underline"
            >
              Chat on WhatsApp
            </a>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-zinc-900/95 border-t border-zinc-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. Steam sale prices, PC specs)..."
              className="flex-1 bg-zinc-950 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-sans"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-zinc-950 font-bold transition-all cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
