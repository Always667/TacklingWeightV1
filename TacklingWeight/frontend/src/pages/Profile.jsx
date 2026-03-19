import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Save, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageTransition, Card, Button, Input, Select } from '../components/ui';

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ alias: '', heightCm: '', startWeightKg: '', goal: 'lose' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    api.getProfile()
      .then((data) => {
        const u = data.user;
        setForm({
          alias: u.alias || '',
          heightCm: u.heightCm || '',
          startWeightKg: u.startWeightKg || '',
          goal: u.goal || 'lose',
        });
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({
        alias: form.alias,
        heightCm: Number(form.heightCm),
        startWeightKg: Number(form.startWeightKg),
        goal: form.goal,
      });
      await refreshUser();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteAllData();
      toast.success('All data deleted');
      logout();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <PageTransition>
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your account and preferences</p>
        </div>

        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-brand-500/20">
            {(form.alias?.[0] || user?.alias?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{form.alias || 'User'}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </motion.div>

        {/* Profile form */}
        <Card>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Display Name" value={form.alias} onChange={set('alias')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Height (cm)" type="number" value={form.heightCm} onChange={set('heightCm')} />
              <Input label="Start Weight (kg)" type="number" step="0.1" value={form.startWeightKg} onChange={set('startWeightKg')} />
            </div>
            <Select label="Goal" value={form.goal} onChange={set('goal')}>
              <option value="lose">Lose Weight</option>
              <option value="gain">Gain Weight</option>
              <option value="maintain">Maintain Weight</option>
            </Select>
            <div className="pt-2">
              <Button type="submit" loading={saving} className="w-full">
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Danger zone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="border-red-200 bg-red-50/50">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 text-sm">Danger Zone</h3>
                <p className="text-xs text-red-700 mt-0.5">
                  Permanently delete all your weigh-in data and challenge history.
                  This cannot be undone.
                </p>
              </div>
            </div>
            {confirmDelete ? (
              <div className="flex gap-2 ml-8">
                <Button
                  variant="ghost"
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Yes, delete everything
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="ml-8 px-3 py-1.5 rounded-lg border border-red-300 text-red-700 text-xs font-medium hover:bg-red-100 transition-colors"
              >
                Delete all my data
              </button>
            )}
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
