import { motion, AnimatePresence } from 'framer-motion';

export default function ScoreWidget({ score, total, popKey }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-6 right-6 z-50 glass rounded-2xl px-5 py-3 shadow-glow"
    >
      <p className="text-xs uppercase tracking-wider text-white/50 mb-0.5">Score</p>
      <div className="flex items-baseline gap-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={popKey}
            initial={{ scale: 1.8, filter: 'drop-shadow(0 0 12px rgba(34,211,238,0.9))' }}
            animate={{ scale: 1, filter: 'drop-shadow(0 0 0px transparent)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="font-display text-3xl font-bold text-accent-cyan tabular-nums"
          >
            {score}
          </motion.span>
        </AnimatePresence>
        <span className="text-white/40 text-lg">/ {total}</span>
      </div>
    </motion.div>
  );
}
