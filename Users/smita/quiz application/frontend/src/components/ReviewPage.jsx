import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ReviewPage({ answers, onRestart }) {
  const { user, logout } = useAuth();
  const [difficulty, setDifficulty] = useState('');
  const [feedback, setFeedback] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .submitQuiz({ answers, feedbackText: '', difficultyRating: '' })
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [answers]);

  async function handleFeedbackSubmit(e) {
    e.preventDefault();
    if (saved || !result?.resultId) return;
    setSubmitting(true);
    setError('');
    try {
      await api.saveFeedback(result.resultId, feedback, difficulty);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <motion.div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-2 border-accent-cyan border-t-transparent rounded-full"
        />
      </motion.div>
    );
  }

  const score = result?.score ?? 0;
  const total = result?.totalQuestions ?? answers.length;
  const percentage = result?.percentage ?? 0;
  const breakdown = result?.breakdown ?? [];

  const performanceLabel =
    percentage >= 80
      ? 'Outstanding!'
      : percentage >= 60
        ? 'Great job!'
        : percentage >= 40
          ? 'Good effort!'
          : 'Keep practicing!';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 md:p-8 py-12"
    >
      <motion.div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 150 }}
          className="glass rounded-3xl p-8 text-center shadow-glow mb-8"
        >
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-accent-cyan text-sm uppercase tracking-widest mb-2"
          >
            Quiz Complete
          </motion.p>
          <motion.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
            className="font-display text-6xl md:text-7xl font-bold bg-gradient-to-r from-accent-cyan to-accent bg-clip-text text-transparent"
          >
            {score}/{total}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-2xl font-display font-semibold mt-2"
          >
            {percentage}% — {performanceLabel}
          </motion.p>
          <p className="text-white/50 mt-2">Nice work, {user?.username}!</p>
        </motion.div>

        {breakdown.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            <h2 className="font-display font-semibold text-lg mb-4">Performance Breakdown</h2>
            <div className="space-y-2">
              {breakdown.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                    item.isCorrect
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}
                >
                  <span className="text-sm">Question {i + 1}</span>
                  <span
                    className={`text-sm font-medium ${
                      item.isCorrect ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {item.timedOut ? 'Timed out' : item.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleFeedbackSubmit}
          className="glass rounded-2xl p-6 space-y-5"
        >
          <h2 className="font-display font-semibold text-lg">Your Feedback</h2>

          <div>
            <label className="block text-sm text-white/60 mb-2">How was the difficulty?</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-elevated/80 border border-white/10 outline-none focus:border-accent"
            >
              <option value="">Select difficulty</option>
              <option value="too_easy">Too easy</option>
              <option value="just_right">Just right</option>
              <option value="too_hard">Too hard</option>
            </select>
          </div>

          <motion.div>
            <label className="block text-sm text-white/60 mb-2">Any issues faced?</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder="Share your experience..."
              className="w-full px-4 py-3 rounded-xl bg-surface-elevated/80 border border-white/10 outline-none focus:border-accent resize-none"
            />
          </motion.div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {saved ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-emerald-400 text-center text-sm"
            >
              Thank you! Your feedback has been saved.
            </motion.p>
          ) : (
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-display font-semibold bg-gradient-to-r from-accent-cyan to-accent disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Submit Feedback'}
            </motion.button>
          )}
        </motion.form>

        <div className="flex gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRestart}
            className="flex-1 py-3 rounded-xl font-display font-semibold border border-white/20 hover:border-accent-glow"
          >
            Play Again
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="flex-1 py-3 rounded-xl font-display font-semibold text-white/60 border border-white/10"
          >
            Log Out
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
