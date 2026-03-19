import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle, Clock, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageTransition, Card, Badge, Button, EmptyState, SkeletonCard } from '../components/ui';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Challenges() {
  const { user } = useAuth();
  const toast = useToast();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);

  const load = () => {
    setLoading(true);
    api.getActiveChallenges()
      .then((data) => setChallenges(data.challenges))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // Re-fetch when user goal changes (e.g. after profile update)
  useEffect(() => { load(); }, [user?.goal]);

  const handleSubmit = async (id, metric) => {
    setSubmitting(id);
    try {
      const body = metric === 'yesno' ? { status: 'yes' } : {};
      const result = await api.submitChallenge(id, body);
      if (result.entry?.pointsAwarded > 0) {
        toast.success(`+${result.entry.pointsAwarded} points earned! 🎉`);
      } else if (metric === 'weight') {
        toast.warning('Not yet verified \u2014 log a weigh-in showing the change, then tap Retry.');
      } else {
        toast.success('Challenge submitted!');
      }
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(null);
    }
  };

  // A weight challenge entry that got 0 points is "unverified" — allow retry
  const getTodayEntry = (entries) =>
    entries.find((e) => new Date(e.date).toDateString() === new Date().toDateString());

  return (
    <PageTransition>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Challenges</h1>
            <p className="text-sm text-slate-500 mt-1">Complete challenges to earn points and climb the leaderboard</p>
          </div>
          {user?.goal && (
            <Badge variant="brand" className="text-xs capitalize">
              {user.goal === 'lose' ? 'Lose Weight' : user.goal === 'gain' ? 'Gain Weight' : 'Maintain'} mode
            </Badge>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : challenges.length === 0 ? (
        <Card>
          <EmptyState
            icon={Target}
            title="No active challenges"
            description="Check back soon for new challenges to complete."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((c, i) => {
            const todayEntry = getTodayEntry(c.userEntries);
            const verified = todayEntry?.pointsAwarded > 0;
            const unverified = todayEntry && !verified && c.metric === 'weight';
            const done = todayEntry && (c.metric !== 'weight' || verified);
            const totalPoints = c.userEntries.reduce((sum, e) => sum + e.pointsAwarded, 0);

            return (
              <motion.div
                key={c._id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="show"
              >
                <Card hover className={`relative overflow-hidden ${
                  done ? 'ring-2 ring-emerald-200' : unverified ? 'ring-2 ring-amber-200' : ''
                }`}>
                  {/* State overlay */}
                  {done && <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none" />}
                  {unverified && <div className="absolute inset-0 bg-gradient-to-br from-amber-50/40 to-transparent pointer-events-none" />}

                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                          done
                            ? 'bg-emerald-100 text-emerald-600'
                            : unverified
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-brand-100 text-brand-600'
                        }`}>
                          {done ? <CheckCircle className="w-5 h-5" /> : unverified ? <AlertCircle className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 text-sm">{c.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={c.type === 'daily' ? 'brand' : 'info'}>{c.type}</Badge>
                            <Badge variant="default">{c.metric}</Badge>
                          </div>
                          {unverified && (
                            <p className="text-xs text-amber-600 mt-1.5">
                              Not yet verified — log a weigh-in showing the loss then retry.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          {c.pointsPerCompletion} pts
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(c.endAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>

                      {done ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </motion.div>
                      ) : unverified ? (
                        <Button
                          onClick={() => handleSubmit(c._id, c.metric)}
                          loading={submitting === c._id}
                          variant="secondary"
                          className="text-xs px-3 py-1.5 flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Retry
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleSubmit(c._id, c.metric)}
                          loading={submitting === c._id}
                          className="text-xs px-3 py-1.5"
                        >
                          {c.metric === 'weight' ? 'Verify' : 'Complete'}
                        </Button>
                      )}
                    </div>

                    {totalPoints > 0 && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                        <Zap className="w-3.5 h-3.5" />
                        {totalPoints} points earned total
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
