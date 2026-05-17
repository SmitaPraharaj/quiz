import { motion } from 'framer-motion';

export default function Timer({ secondsLeft, totalSeconds }) {
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const urgent = secondsLeft <= 5;

  return (
    <motion.div
      className="w-full"
      animate={urgent ? { scale: [1, 1.02, 1] } : {}}
      transition={{ repeat: urgent ? Infinity : 0, duration: 0.5 }}
    >
      <motion.div className="flex justify-between text-sm mb-2">
        <span className="text-white/60">Time remaining</span>
        <motion.span
          key={secondsLeft}
          initial={{ scale: 1.3, color: '#22d3ee' }}
          animate={{ scale: 1, color: urgent ? '#f87171' : '#fff' }}
          className="font-display font-bold tabular-nums"
        >
          {secondsLeft}s
        </motion.span>
      </motion.div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            urgent
              ? 'bg-gradient-to-r from-red-500 to-orange-400'
              : 'bg-gradient-to-r from-accent to-accent-cyan'
          }`}
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}
