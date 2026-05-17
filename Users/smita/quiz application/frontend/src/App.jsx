import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import QuizPage from './components/QuizPage';
import ReviewPage from './components/ReviewPage';

const pageVariants = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};

export default function App() {
  const { isAuthenticated } = useAuth();
  const [screen, setScreen] = useState('quiz');
  const [quizAnswers, setQuizAnswers] = useState([]);

  useEffect(() => {
    if (isAuthenticated && screen === 'login') {
      setScreen('quiz');
    }
  }, [isAuthenticated, screen]);

  function handleLoginSuccess() {
    setScreen('quiz');
  }

  function handleQuizComplete(answers) {
    setQuizAnswers(answers);
    setScreen('review');
  }

  function handleRestart() {
    setQuizAnswers([]);
    setScreen('quiz');
  }

  if (!isAuthenticated) {
    return <LoginPage onSuccess={handleLoginSuccess} />;
  }

  return (
    <AnimatePresence mode="wait">
      {screen === 'quiz' && (
        <motion.div
          key="quiz"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: 'spring', stiffness: 200, damping: 28 }}
        >
          <QuizPage onComplete={handleQuizComplete} />
        </motion.div>
      )}
      {screen === 'review' && (
        <motion.div
          key="review"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: 'spring', stiffness: 200, damping: 28 }}
        >
          <ReviewPage answers={quizAnswers} onRestart={handleRestart} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
