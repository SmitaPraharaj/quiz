import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { rows: questions } = await pool.query(
      `SELECT id, question_text, time_limit_seconds
       FROM questions
       ORDER BY id`
    );

    const { rows: options } = await pool.query(
      `SELECT id, question_id, option_text
       FROM options
       ORDER BY question_id, id`
    );

    const quiz = questions.map((q) => ({
      id: q.id,
      questionText: q.question_text,
      timeLimitSeconds: q.time_limit_seconds,
      options: options
        .filter((o) => o.question_id === q.id)
        .map((o) => ({ id: o.id, optionText: o.option_text })),
    }));

    res.json({ questions: quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

export default router;
