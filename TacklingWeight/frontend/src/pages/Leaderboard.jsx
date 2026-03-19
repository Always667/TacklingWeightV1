import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown } from 'lucide-react';
import { api } from '../api';
import { PageTransition, Card, Badge, Skeleton, EmptyState } from '../components/ui';

const podiumColors = [
  'from-amber-400 to-yellow-500',   // 1st
  'from-slate-300 to-slate-400',     // 2nd
  'from-amber-600 to-orange-700',    // 3rd
];
const podiumBg = [
  'bg-amber-50 border-amber-200',
  'bg-slate-50 border-slate-200',
  'bg-orange-50 border-orange-200',
];
const medals = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [period, setPeriod] = useState('weekly');
  const [loading, setLoading] = useState(true);

  const load = (p) => {
    setLoading(true);
    api.getLeaderboard(p)
      .then((data) => setLeaderboard(data.leaderboard))
      .catch(() => setLeaderboard([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(period); }, [period]);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <PageTransition>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leaderboard</h1>
          <p className="text-sm text-slate-500 mt-1">See how you rank against others</p>
        </div>
        <div className="flex bg-slate-100 rounded-xl p-1">
          {['weekly', 'allTime'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                period === p
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p === 'weekly' ? 'Weekly' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <Card>
          <EmptyState
            icon={Trophy}
            title="No rankings yet"
            description="Complete challenges to appear on the leaderboard."
          />
        </Card>
      ) : (
        <>
          {/* Podium — display order: 2nd (left), 1st (centre), 3rd (right) */}
          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[1, 0, 2]
                .filter((originalIdx) => top3[originalIdx] != null)
                .map((originalIdx, displayIdx) => {
                  const entry = top3[originalIdx];
                  const isFirst = originalIdx === 0;

                  return (
                    <motion.div
                      key={entry.rank}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: displayIdx * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className={`${isFirst ? '-mt-4' : ''}`}
                    >
                      <div className={`text-center p-4 rounded-2xl border ${podiumBg[originalIdx]} ${isFirst ? 'pb-6' : ''}`}>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + displayIdx * 0.1, type: 'spring', stiffness: 400 }}
                          className="text-3xl mb-2"
                        >
                          {medals[originalIdx]}
                        </motion.div>
                        <div
                          className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${podiumColors[originalIdx]} text-white flex items-center justify-center font-bold text-lg shadow-lg mb-2`}
                        >
                          {entry.alias?.[0]?.toUpperCase() || '?'}
                        </div>
                        <p className="font-bold text-slate-900 text-sm truncate">{entry.alias}</p>
                        <p className="text-xs font-semibold mt-1">
                          <span className="gradient-text">{entry.points} pts</span>
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}

          {/* Rest of the list */}
          {rest.length > 0 && (
            <Card>
              <div className="divide-y divide-slate-100">
                {rest.map((entry, i) => (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                    className="flex items-center justify-between py-3.5"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 text-center text-sm font-bold text-slate-400">
                        #{entry.rank}
                      </span>
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                        {entry.alias?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-sm font-medium text-slate-800">{entry.alias}</span>
                    </div>
                    <span className="text-sm font-bold text-brand-600">{entry.points} pts</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </PageTransition>
  );
}
