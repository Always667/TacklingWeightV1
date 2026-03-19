import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip,
} from 'chart.js';
import { Plus, Scale, Calendar, X } from 'lucide-react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import { PageTransition, Card, Button, Modal, EmptyState, Skeleton } from '../components/ui';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export default function Progress() {
  const toast = useToast();
  const chartRef = useRef(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api.getSummary()
      .then(setSummary)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.addWeighIn({ date, weightKg: parseFloat(weight) });
      toast.success('Weigh-in logged!');
      setModalOpen(false);
      setWeight('');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const sorted = summary?.weighIns
    ? [...summary.weighIns].sort((a, b) => new Date(a.date) - new Date(b.date))
    : [];

  const chartData = {
    labels: sorted.map((w) =>
      new Date(w.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    ),
    datasets: [
      {
        data: sorted.map((w) => w.weightKg),
        borderColor: '#6366f1',
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'rgba(99, 102, 241, 0.05)';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.01)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3,
        borderWidth: 2.5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        padding: 12,
        cornerRadius: 12,
        titleFont: { weight: 600 },
        bodyFont: { size: 13 },
        displayColors: false,
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} kg`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11, weight: 500 } },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 11, weight: 500 },
          callback: (v) => `${v} kg`,
        },
        border: { display: false },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  return (
    <PageTransition>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Progress</h1>
          <p className="text-sm text-slate-500 mt-1">Track your weight journey over time</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Weigh-in
        </Button>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Weight Over Time</h2>
            {summary && (
              <span className="text-xs text-slate-400">{summary.totalWeighIns} entries</span>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : sorted.length > 0 ? (
            <div style={{ height: 300 }}>
              <Line ref={chartRef} data={chartData} options={chartOptions} />
            </div>
          ) : (
            <EmptyState
              icon={Scale}
              title="No weigh-ins yet"
              description="Add your first weigh-in to start tracking progress."
            />
          )}
        </Card>
      </motion.div>

      {/* History */}
      {sorted.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <Card>
            <h2 className="text-base font-semibold text-slate-800 mb-4">History</h2>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {[...sorted].reverse().map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-brand-500" />
                    </div>
                    <span className="text-sm text-slate-600">
                      {new Date(w.date).toLocaleDateString('en-GB', {
                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{w.weightKg} kg</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Add modal */}
      <AnimatePresence>
        {modalOpen && (
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Weigh-in">
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label htmlFor="wi-date" className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                <input
                  id="wi-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="wi-weight" className="block text-sm font-medium text-slate-700 mb-1.5">Weight (kg)</label>
                <input
                  id="wi-weight"
                  type="number"
                  step="0.1"
                  min="20"
                  max="500"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 75.5"
                  className="input-field"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" loading={submitting} className="flex-1">
                  Save
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
