import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Timer from './Timer';
import ScoreWidget from './ScoreWidget';

export default function QuizPage({ onComplete }) {
  const { user, logout } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [liveScore, setLiveScore] = useState(0);
  const [scorePopKey, setScorePopKey] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [locked, setLocked] = useState(false);
  const [direction, setDirection] = useState(1);
  const answersRef = useRef([]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  useEffect(() => {
    api
      .getQuestions()
      .then((data) => {
        setQuestions(data.questions);
        if (data.questions.length > 0) {
          setSecondsLeft(data.questions[0].timeLimitSeconds);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const advanceQuestion = useCallback(
    (answerEntry) => {
      const updated = [...answersRef.current, answerEntry];
      answersRef.current = updated;
      setAnswers(updated);
      setSelectedOptionId(null);
      setLocked(false);

      if (currentIndex + 1 >= totalQuestions) {
        onComplete(updated);
        return;
      }

      setDirection(1);
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setSecondsLeft(questions[next].timeLimitSeconds);
    },
    [currentIndex, totalQuestions, onComplete, questions]
  );

  const handleTimeout = useCallback(() => {
    if (locked || !currentQuestion) return;
    setLocked(true);
    advanceQuestion({
      questionId: currentQuestion.id,
      optionId: selectedOptionId,
      timedOut: true,
    });
  }, [locked, currentQuestion, selectedOptionId, advanceQuestion]);

  useEffect(() => {
    if (!currentQuestion || locked) return;

    if (secondsLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, currentQuestion, locked, handleTimeout]);

  function handleSelect(optionId) {
    if (locked) return;
    setSelectedOptionId(optionId);
  }

  async function handleSubmit() {
    if (locked || !selectedOptionId || !currentQuestion) return;
    setLocked(true);

    try {
      const { isCorrect } = await api.validateAnswer(selectedOptionId);
      if (isCorrect) {
        setLiveScore((s) => s + 1);
        setScorePopKey((k) => k + 1);
      }
    } catch {
      /* score pop is best-effort */
    }

    advanceQuestion({
      questionId: currentQuestion.id,
      optionId: selectedOptionId,
      timedOut: false,
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/60">
        No questions available.
      </div>
    );
  }

  return (
    <motion.div className="min-h-screen p-4 md:p-8 pt-24">
      <ScoreWidget score={liveScore} total={totalQuestions} popKey={scorePopKey} />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto mb-8 flex justify-between items-center"
      >
        <div>
          <p className="text-white/50 text-sm">Welcome, {user?.username}</p>
          <p className="font-display font-semibold text-lg">
            Question {currentIndex + 1} of {totalQuestions}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className="text-sm text-white/40 hover:text-white px-3 py-1.5 rounded-lg border border-white/10"
        >
          Log out
        </motion.button>
      </motion.header>

      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Timer
            secondsLeft={secondsLeft}
            totalSeconds={currentQuestion.timeLimitSeconds}
          />
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -80 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="glass rounded-3xl p-6 md:p-8 shadow-glow"
          >
            <h2 className="font-display text-xl md:text-2xl font-semibold leading-relaxed mb-8">
              {currentQuestion.questionText}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((opt, i) => {
                const selected = selectedOptionId === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    type="button"
                    disabled={locked}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={!locked ? { scale: 1.01, x: 4 } : {}}
                    whileTap={!locked ? { scale: 0.99 } : {}}
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
                      locked
                        ? 'opacity-50 cursor-not-allowed border-white/5'
                        : selected
                          ? 'border-accent-cyan bg-accent-cyan/10 shadow-glow-cyan'
                          : 'border-white/10 bg-surface-elevated/50 hover:border-white/20'
                    }`}
                  >
                    <span className="inline-flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          selected ? 'bg-accent-cyan text-surface' : 'bg-white/10'
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt.optionText}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              type="button"
              disabled={!selectedOptionId || locked}
              whileHover={selectedOptionId && !locked ? { scale: 1.02 } : {}}
              whileTap={selectedOptionId && !locked ? { scale: 0.98 } : {}}
              onClick={handleSubmit}
              className="mt-8 w-full py-3.5 rounded-xl font-display font-semibold bg-gradient-to-r from-accent to-violet-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {locked ? 'Moving on...' : 'Submit Answer'}
            </motion.button>
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="mt-4 flex gap-1 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {questions.map((_, i) => (
            <motion.div
              key={i}
              className={`h-1.5 rounded-full ${
                i === currentIndex ? 'w-8 bg-accent-cyan' : i < currentIndex ? 'w-4 bg-accent/60' : 'w-4 bg-white/10'
              }`}
              layout
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
