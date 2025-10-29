require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.sqlite');
const db = new Database(DB_PATH);

// Initialize table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT,
    amount REAL,
    date TEXT
  );
`);

// Helpers
const insertTxn = db.prepare('INSERT INTO transactions (description, amount, date) VALUES (?, ?, ?)');
const getAll = db.prepare('SELECT * FROM transactions ORDER BY id DESC');
const getById = db.prepare('SELECT * FROM transactions WHERE id = ?');
const deleteById = db.prepare('DELETE FROM transactions WHERE id = ?');
const updateById = db.prepare('UPDATE transactions SET description = ?, amount = ?, date = ? WHERE id = ?');

// Routes
app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/transactions', (req, res) => {
  const rows = getAll.all();
  res.json(rows);
});

app.get('/transactions/:id', (req, res) => {
  const row = getById.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

app.post('/transactions', (req, res) => {
  const { description, amount, date } = req.body;
  const info = insertTxn.run(description, amount, date || new Date().toISOString());
  const created = getById.get(info.lastInsertRowid);
  res.status(201).json(created);
});

app.put('/transactions/:id', (req, res) => {
  const { description, amount, date } = req.body;
  updateById.run(description, amount, date || new Date().toISOString(), req.params.id);
  const updated = getById.get(req.params.id);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/transactions/:id', (req, res) => {
  deleteById.run(req.params.id);
  res.status(204).end();
});

// Start
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port} (DB: ${DB_PATH})`);
});