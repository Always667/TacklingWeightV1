import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scale, Ruler, TrendingDown, TrendingUp, Minus,
  Target, Sparkles, Trophy, Plus, Activity,
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { PageTransition, Card, StatCard, Badge, SkeletonCard, Button } from '../components/ui';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSummary()
      .then(setSummary)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const bmiColor = {
    underweight: 'warning',
    normal: 'success',
    overweight: 'warning',
    obese: 'danger',
  };

  const goalIcon = {
    lose: TrendingDown,
    gain: TrendingUp,
    maintain: Minus,
  };

  const goalLabel = {
    lose: 'Lose weight',
    gain: 'Gain weight',
    maintain: 'Maintain',
  };

  const TrendIcon = summary?.goal ? goalIcon[summary.goal] : Minus;

  return (
    <PageTransition>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="relative overflow-hidden rounded-2xl gradient-brand p-6 lg:p-8 text-white">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4 blur-2xl" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-violet-400/20 translate-y-1/2 blur-xl" />

          <div className="relative z-10">
            <p className="text-white/70 text-sm font-medium">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-2xl lg:text-3xl font-bold mt-1">
              Welcome back, {user?.alias || 'there'} 👋
            </h1>
            <p className="text-white/70 mt-2 max-w-lg">
              Keep up the momentum — every small step counts towards your wellness goals.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : summary && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            label="Current Weight"
            value={summary.currentWeightKg ? `${summary.currentWeightKg} kg` : '—'}
            icon={Scale}
            color="brand"
            delay={0}
          />
          <StatCard
            label="BMI"
            value={summary.bmi || '—'}
            sublabel={summary.bmiCategory && (
              <Badge variant={bmiColor[summary.bmiCategory] || 'default'} className="mt-1">
                {summary.bmiCategory}
              </Badge>
            )}
            icon={Activity}
            color="sky"
            delay={0.08}
          />
          <StatCard
            label="Weight Change"
            value={
              summary.weightChange !== null
                ? `${summary.weightChange > 0 ? '+' : ''}${summary.weightChange} kg`
                : '—'
            }
            icon={TrendIcon}
            color={summary.weightChange < 0 ? 'emerald' : summary.weightChange > 0 ? 'rose' : 'amber'}
            delay={0.16}
          />
          <StatCard
            label="Goal"
            value={goalLabel[summary.goal] || 'Not set'}
            sublabel={`${summary.totalWeighIns} weigh-ins logged`}
            icon={Target}
            color="amber"
            delay={0.24}
          />
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/progress">
            <Card hover className="group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 shadow-md shadow-brand-500/20 text-white group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Log Weight</p>
                  <p className="text-xs text-slate-500">Add a new weigh-in</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/advice">
            <Card hover className="group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md shadow-amber-500/20 text-white group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Get Advice</p>
                  <p className="text-xs text-slate-500">Personalised guidance</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/challenges">
            <Card hover className="group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/20 text-white group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Challenges</p>
                  <p className="text-xs text-slate-500">Earn points today</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </motion.div>

      {/* Recent weigh-ins */}
      {summary?.weighIns?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Recent Weigh-ins</h2>
            <Link to="/progress" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
              View all →
            </Link>
          </div>
          <Card>
            <div className="divide-y divide-slate-100">
              {summary.weighIns.slice(-5).reverse().map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                      <Scale className="w-4 h-4 text-brand-500" />
                    </div>
                    <span className="text-sm text-slate-600">
                      {new Date(w.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{w.weightKg} kg</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </PageTransition>
  );
}
