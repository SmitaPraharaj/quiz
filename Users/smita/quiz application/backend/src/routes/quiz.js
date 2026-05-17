import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/validate', authenticate, async (req, res) => {
  try {
    const { optionId } = req.body;
    if (!optionId) {
      return res.status(400).json({ error: 'optionId required' });
    }

    const { rows } = await pool.query(
      'SELECT is_correct FROM options WHERE id = $1',
      [optionId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Option not found' });
    }

    res.json({ isCorrect: rows[0].is_correct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Validation failed' });
  }
});

router.post('/submit', authenticate, async (req, res) => {
  try {
    const { answers, feedbackText, difficultyRating } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Answers array required' });
    }

    const optionIds = answers.map((a) => a.optionId).filter(Boolean);

    const correctMap = new Map();
    if (optionIds.length > 0) {
      const { rows: correctRows } = await pool.query(
        `SELECT id, is_correct FROM options WHERE id = ANY($1::int[])`,
        [optionIds]
      );
      correctRows.forEach((r) => correctMap.set(r.id, r.is_correct));
    }

    let score = 0;
    const breakdown = answers.map((a) => {
      const isCorrect = a.optionId ? correctMap.get(a.optionId) === true : false;
      if (isCorrect) score += 1;
      return {
        questionId: a.questionId,
        optionId: a.optionId,
        isCorrect,
        timedOut: Boolean(a.timedOut),
      };
    });

    const { rows: resultRows } = await pool.query(
      `INSERT INTO user_results (user_id, score, total_questions, feedback_text, difficulty_rating)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, score, total_questions, completed_at`,
      [
        req.user.id,
        score,
        answers.length,
        feedbackText?.trim() || null,
        difficultyRating || null,
      ]
    );

    const result = resultRows[0];
    res.json({
      resultId: result.id,
      score,
      totalQuestions: result.total_questions,
      percentage: Math.round((score / result.total_questions) * 100),
      breakdown,
      completedAt: result.completed_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

router.patch('/feedback/:resultId', authenticate, async (req, res) => {
  try {
    const { resultId } = req.params;
    const { feedbackText, difficultyRating } = req.body;

    const { rows } = await pool.query(
      `UPDATE user_results
       SET feedback_text = COALESCE($1, feedback_text),
           difficulty_rating = COALESCE($2, difficulty_rating)
       WHERE id = $3 AND user_id = $4
       RETURNING id`,
      [feedbackText?.trim() || null, difficultyRating || null, resultId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.json({ message: 'Feedback saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

export default router;
