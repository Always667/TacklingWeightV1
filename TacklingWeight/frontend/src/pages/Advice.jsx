import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Lightbulb, UtensilsCrossed, Dumbbell,
  ArrowRightLeft, AlertTriangle, Send, Loader2,
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

export default function Advice() {
  const toast = useToast();
  const [flags, setFlags] = useState('');
  const [prompt, setPrompt] = useState('');
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Wellness Advice</h1>
        <p className="text-sm text-slate-500 mt-1">
          Get personalised guidance based on your profile and preferences
        </p>
      </div>

      {/* Input form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
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
              Get Advice
            </Button>
          </form>
        </Card>
      </motion.div>

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col items-center py-12 gap-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-sm text-slate-500">Generating your advice…</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {advice && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-5"
          >
            {/* Tips */}
            <motion.div variants={fadeUpItem}>
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-slate-800">Tips</h3>
                </div>
                <ul className="space-y-2.5">
                  {advice.tips.map((tip, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm text-slate-700 leading-relaxed">{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            {/* Meal Ideas */}
            <motion.div variants={fadeUpItem}>
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-slate-800">Meal Ideas</h3>
                </div>
                <div className="space-y-3">
                  {advice.mealIdeas.map((meal, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <p className="text-sm font-medium text-slate-800">{meal.meal}</p>
                      <p className="text-xs text-slate-500 mt-1">{meal.rationale}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Workout */}
            <motion.div variants={fadeUpItem}>
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-slate-800">3-Day Workout Plan</h3>
                </div>
                <div className="space-y-3">
                  {advice.workoutPlan.map((day, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full gradient-brand text-white flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </div>
                        {i < advice.workoutPlan.length - 1 && (
                          <div className="w-0.5 flex-1 bg-brand-200 mt-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-semibold text-slate-800">{day.day}</p>
                        <ul className="mt-1 space-y-1">
                          {day.activities.map((a, j) => (
                            <li key={j} className="text-xs text-slate-600 flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-slate-400" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Safer Swaps */}
            {advice.saferSwaps?.length > 0 && (
              <motion.div variants={fadeUpItem}>
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-xl bg-violet-100 text-violet-600">
                      <ArrowRightLeft className="w-4 h-4" />
                    </div>
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

            {/* Disclaimer */}
            <motion.div variants={fadeUpItem}>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 font-medium">{advice.disclaimer}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
