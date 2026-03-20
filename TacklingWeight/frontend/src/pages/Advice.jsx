import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Lightbulb, UtensilsCrossed, Dumbbell,
  ArrowRightLeft, AlertTriangle, Send, Loader2, Bot, User2,
  ChevronDown,
} from 'lucide-react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import { PageTransition, Card, Button, Badge } from '../components/ui';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUpItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

// ── AI Chat ──────────────────────────────────────────────────────────────────

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-brand-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
        {isUser ? <User2 className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'bg-brand-500 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
        {msg.content}
      </div>
    </motion.div>
  );
}

function AIChat() {
  const toast = useToast();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI health coach. Ask me anything about nutrition, exercise, weight loss, hydration, or general wellness — I'm here to help! 💪" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Send conversation history (excluding the first greeting)
      const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }));
      const { reply } = await api.chatAdvice({ message: text, history });
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      toast.error(err.message);
      // Remove the optimistically added user message on failure
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'How do I lose weight safely?',
    'What should I eat before a workout?',
    'How much water should I drink daily?',
    'Tips to stay motivated?',
  ];

  return (
    <Card className="flex flex-col" style={{ minHeight: '480px' }}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
          <Bot className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">AI Health Coach</h3>
          <p className="text-xs text-slate-400">Powered by OpenAI · ask anything health-related</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Online
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4" style={{ maxHeight: '360px' }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} />
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-2.5 rounded-2xl rounded-tl-sm bg-slate-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions (only show when just the greeting is visible) */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setInput(s)}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-600 border border-slate-200 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={send} className="flex gap-2 mt-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          placeholder="Ask a health question…"
          className="input-field flex-1"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </Card>
  );
}

// ── Rule-based Advice (existing) ─────────────────────────────────────────────

function RuleBasedAdvice() {
  const toast = useToast();
  const [flags, setFlags] = useState('');
  const [prompt, setPrompt] = useState('');
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAdvice(null);
    try {
      const flagArr = flags ? flags.split(',').map((f) => f.trim()).filter(Boolean) : [];
      const data = await api.getAdvice({ flags: flagArr, prompt });
      setAdvice(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 mb-4 text-slate-700 font-semibold hover:text-brand-600 transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        Personalised Wellness Plan
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="mb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="adv-flags" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Dietary preferences
                  </label>
                  <input
                    id="adv-flags"
                    type="text"
                    value={flags}
                    onChange={(e) => setFlags(e.target.value)}
                    placeholder="e.g. vegetarian, low sugar"
                    className="input-field"
                  />
                  <p className="text-xs text-slate-400 mt-1">Comma-separated</p>
                </div>
                <div>
                  <label htmlFor="adv-prompt" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Specific question (optional)
                  </label>
                  <input
                    id="adv-prompt"
                    type="text"
                    maxLength={300}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. How can I stay motivated?"
                    className="input-field"
                  />
                </div>
                <Button type="submit" loading={loading}>
                  <Sparkles className="w-4 h-4" />
                  Generate Plan
                </Button>
              </form>
            </Card>

            {loading && (
              <div className="flex flex-col items-center py-12 gap-3">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                <p className="text-sm text-slate-500">Generating your plan…</p>
              </div>
            )}

            <AnimatePresence>
              {advice && (
                <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
                  <motion.div variants={fadeUpItem}>
                    <Card>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-xl bg-amber-100 text-amber-600"><Lightbulb className="w-4 h-4" /></div>
                        <h3 className="font-semibold text-slate-800">Tips</h3>
                      </div>
                      <ul className="space-y-2.5">
                        {advice.tips.map((tip, i) => (
                          <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3">
                            <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                            <span className="text-sm text-slate-700 leading-relaxed">{tip}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </Card>
                  </motion.div>

                  <motion.div variants={fadeUpItem}>
                    <Card>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600"><UtensilsCrossed className="w-4 h-4" /></div>
                        <h3 className="font-semibold text-slate-800">Meal Ideas</h3>
                      </div>
                      <div className="space-y-3">
                        {advice.mealIdeas.map((meal, i) => (
                          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-sm font-medium text-slate-800">{meal.meal}</p>
                            <p className="text-xs text-slate-500 mt-1">{meal.rationale}</p>
                          </motion.div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>

                  <motion.div variants={fadeUpItem}>
                    <Card>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-xl bg-sky-100 text-sky-600"><Dumbbell className="w-4 h-4" /></div>
                        <h3 className="font-semibold text-slate-800">3-Day Workout Plan</h3>
                      </div>
                      <div className="space-y-3">
                        {advice.workoutPlan.map((day, i) => (
                          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full gradient-brand text-white flex items-center justify-center text-xs font-bold">{i + 1}</div>
                              {i < advice.workoutPlan.length - 1 && <div className="w-0.5 flex-1 bg-brand-200 mt-1" />}
                            </div>
                            <div className="pb-4">
                              <p className="text-sm font-semibold text-slate-800">{day.day}</p>
                              <ul className="mt-1 space-y-1">
                                {day.activities.map((a, j) => (
                                  <li key={j} className="text-xs text-slate-600 flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-slate-400" />{a}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>

                  {advice.saferSwaps?.length > 0 && (
                    <motion.div variants={fadeUpItem}>
                      <Card>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 rounded-xl bg-violet-100 text-violet-600"><ArrowRightLeft className="w-4 h-4" /></div>
                          <h3 className="font-semibold text-slate-800">Safer Swaps</h3>
                        </div>
                        <div className="space-y-2">
                          {advice.saferSwaps.map((swap, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm">
                              <Badge variant="danger">Instead of</Badge>
                              <span className="text-slate-600">{swap.instead}</span>
                              <span className="text-slate-300">→</span>
                              <Badge variant="success">Try</Badge>
                              <span className="text-slate-800 font-medium">{swap.try}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  <motion.div variants={fadeUpItem}>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800 font-medium">{advice.disclaimer}</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Advice() {
  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Wellness Advice</h1>
        <p className="text-sm text-slate-500 mt-1">
          Chat with your AI health coach or generate a personalised wellness plan
        </p>
      </div>

      <AIChat />
      <RuleBasedAdvice />
    </PageTransition>
  );
}
