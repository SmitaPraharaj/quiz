import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function init() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM questions');
  if (rows[0].count > 0) {
    console.log('Database already seeded.');
    await pool.end();
    return;
  }

  const questions = [
    {
      text: 'What is the capital of France?',
      time: 25,
      options: [
        { text: 'Berlin', correct: false },
        { text: 'Paris', correct: true },
        { text: 'Madrid', correct: false },
        { text: 'Rome', correct: false },
      ],
    },
    {
      text: 'Which planet is known as the Red Planet?',
      time: 20,
      options: [
        { text: 'Venus', correct: false },
        { text: 'Mars', correct: true },
        { text: 'Jupiter', correct: false },
        { text: 'Saturn', correct: false },
      ],
    },
    {
      text: 'What does HTML stand for?',
      time: 30,
      options: [
        { text: 'Hyper Text Markup Language', correct: true },
        { text: 'High Tech Modern Language', correct: false },
        { text: 'Home Tool Markup Language', correct: false },
        { text: 'Hyperlink Text Management Language', correct: false },
      ],
    },
    {
      text: 'Which element has the chemical symbol "O"?',
      time: 20,
      options: [
        { text: 'Gold', correct: false },
        { text: 'Oxygen', correct: true },
        { text: 'Osmium', correct: false },
        { text: 'Oganesson', correct: false },
      ],
    },
    {
      text: 'Who painted the Mona Lisa?',
      time: 25,
      options: [
        { text: 'Vincent van Gogh', correct: false },
        { text: 'Leonardo da Vinci', correct: true },
        { text: 'Michelangelo', correct: false },
        { text: 'Pablo Picasso', correct: false },
      ],
    },
    {
      text: 'What is 15 × 4?',
      time: 15,
      options: [
        { text: '45', correct: false },
        { text: '60', correct: true },
        { text: '50', correct: false },
        { text: '55', correct: false },
      ],
    },
    {
      text: 'Which programming language runs in the browser?',
      time: 25,
      options: [
        { text: 'Python', correct: false },
        { text: 'JavaScript', correct: true },
        { text: 'C++', correct: false },
        { text: 'Rust', correct: false },
      ],
    },
    {
      text: 'What year did the Titanic sink?',
      time: 30,
      options: [
        { text: '1905', correct: false },
        { text: '1912', correct: true },
        { text: '1920', correct: false },
        { text: '1898', correct: false },
      ],
    },
  ];

  for (const q of questions) {
    const { rows: qRows } = await pool.query(
      'INSERT INTO questions (question_text, time_limit_seconds) VALUES ($1, $2) RETURNING id',
      [q.text, q.time]
    );
    const questionId = qRows[0].id;
    for (const opt of q.options) {
      await pool.query(
        'INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, $2, $3)',
        [questionId, opt.text, opt.correct]
      );
    }
  }

  console.log(`Seeded ${questions.length} questions.`);
  await pool.end();
}

init().catch((err) => {
  console.error('Database init failed:', err);
  process.exit(1);
});
