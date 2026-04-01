import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './src/db.ts';
import { GoogleGenAI } from '@google/genai';

const JWT_SECRET = process.env.JWT_SECRET || 'habithero-super-secret-key';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
  };

  // Auth Endpoints
  app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name, role, rollNumber, department, registerNumber } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare(`
        INSERT INTO users (
          email, password, name, role, roll_number, department, register_number,
          xp_points, level, daily_streak, longest_streak, completed_habits_count,
          missed_habits_count, attendance_percentage, weekly_score, monthly_score
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0)
      `);
      const info = stmt.run(email, hashedPassword, name, role || 'student', rollNumber, department, registerNumber);
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  });

  // Student Endpoints
  app.get('/api/student/profile', authenticateToken, (req: any, res) => {
    const user = db.prepare(`
      SELECT id, email, name, role, roll_number, department, register_number, 
             xp_points, level, daily_streak, longest_streak, completed_habits_count,
             missed_habits_count, attendance_percentage, weekly_score, monthly_score
      FROM users WHERE id = ?
    `).get(req.user.id);
    res.json(user);
  });

  app.get('/api/student/habits', authenticateToken, (req: any, res) => {
    const habits = db.prepare('SELECT * FROM habits WHERE user_id = ?').all(req.user.id);
    res.json(habits);
  });

  app.post('/api/student/habits', authenticateToken, (req: any, res) => {
    const { name, type, goalValue, unit } = req.body;
    const stmt = db.prepare('INSERT INTO habits (user_id, name, type, goal_value, unit) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(req.user.id, name, type, goalValue, unit);
    res.status(201).json({ id: info.lastInsertRowid });
  });

  app.get('/api/student/logs', authenticateToken, (req: any, res) => {
    const logs = db.prepare('SELECT * FROM habit_logs WHERE user_id = ?').all(req.user.id);
    res.json(logs);
  });

  app.post('/api/student/logs', authenticateToken, (req: any, res) => {
    const { habitId, value, status, date } = req.body;
    
    // Validation
    if (typeof habitId !== 'number' || isNaN(habitId)) return res.status(400).json({ error: 'Invalid habitId' });
    if (typeof value !== 'number' || isNaN(value)) return res.status(400).json({ error: 'Invalid value' });
    if (!['done', 'missed'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    if (!date) return res.status(400).json({ error: 'Date is required' });

    try {
      const stmt = db.prepare(`
        INSERT INTO habit_logs (habit_id, user_id, value, status, logged_date)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(habit_id, logged_date) DO UPDATE SET value=excluded.value, status=excluded.status
      `);
      stmt.run(habitId, req.user.id, value, status, date);
      
      const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
      let { xp_points, level, daily_streak, longest_streak, completed_habits_count, missed_habits_count } = user;

      if (status === 'done') {
        xp_points += 10;
        completed_habits_count += 1;
        
        // Streak Logic
        // Check if all habits for today are done to award bonus and streak
        const habits = db.prepare('SELECT id FROM habits WHERE user_id = ?').all(req.user.id);
        const logsToday = db.prepare('SELECT status FROM habit_logs WHERE user_id = ? AND logged_date = ? AND status = "done"').all(req.user.id, date);
        
        if (logsToday.length === habits.length) {
          xp_points += 20; // All habits bonus
          daily_streak += 1;
          if (daily_streak > longest_streak) longest_streak = daily_streak;
        } else if (logsToday.length === 1 && daily_streak === 0) {
          // First habit of the day starts the streak if it was 0
          // Wait, the requirement says "First completed habit -> streak becomes 1"
          // But usually streak is daily. If I complete one habit today, does streak become 1?
          // "Missing a day resets streak to 0"
          // I'll assume streak is incremented once per day when at least one habit is completed, 
          // and reset if a day is missed.
          // Actually, I'll stick to: if at least one habit is done today, streak is at least 1.
          if (daily_streak === 0) daily_streak = 1;
          if (daily_streak > longest_streak) longest_streak = daily_streak;
        }
      } else {
        missed_habits_count += 1;
        daily_streak = 0; // Reset streak on miss
      }

      // Level up logic: every 100 XP
      level = Math.floor(xp_points / 100);

      db.prepare(`
        UPDATE users SET 
          xp_points = ?, level = ?, daily_streak = ?, longest_streak = ?, 
          completed_habits_count = ?, missed_habits_count = ?
        WHERE id = ?
      `).run(xp_points, level, daily_streak, longest_streak, completed_habits_count, missed_habits_count, req.user.id);
      
      res.json({ success: true, xp_points, level, daily_streak });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/student/attendance', authenticateToken, (req: any, res) => {
    const attendance = db.prepare('SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC').all(req.user.id);
    res.json(attendance);
  });

  // Admin Endpoints
  app.get('/api/admin/students', authenticateToken, isAdmin, (req, res) => {
    const students = db.prepare(`
      SELECT id, email, name, roll_number, department, register_number, 
             xp_points, level, daily_streak, longest_streak, attendance_percentage 
      FROM users WHERE role = "student"
    `).all();
    res.json(students);
  });

  app.post('/api/admin/students', authenticateToken, isAdmin, async (req, res) => {
    const { email, password, name, rollNumber, department, registerNumber } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password || 'student123', 10);
      const stmt = db.prepare(`
        INSERT INTO users (
          email, password, name, role, roll_number, department, register_number,
          xp_points, level, daily_streak, longest_streak, completed_habits_count,
          missed_habits_count, attendance_percentage, weekly_score, monthly_score
        )
        VALUES (?, ?, ?, 'student', ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0)
      `);
      const info = stmt.run(email, hashedPassword, name, rollNumber, department, registerNumber);
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/admin/attendance', authenticateToken, isAdmin, (req, res) => {
    const { userId, status, date } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO attendance (user_id, status, date) VALUES (?, ?, ?) ON CONFLICT(user_id, date) DO UPDATE SET status=excluded.status');
      stmt.run(userId, status, date);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/admin/reports/:userId', authenticateToken, isAdmin, (req, res) => {
    const logs = db.prepare(`
      SELECT hl.*, h.name as habit_name 
      FROM habit_logs hl 
      JOIN habits h ON hl.habit_id = h.id 
      WHERE hl.user_id = ?
    `).all(req.params.userId);
    res.json(logs);
  });

  // Gemini Motivation
  app.get('/api/motivation', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.json({ quote: "Keep pushing forward! Every small step counts." });
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Give me a short, powerful motivational quote for a student tracking their habits. Keep it under 20 words.",
      });
      res.json({ quote: response.text.trim() });
    } catch (error) {
      res.json({ quote: "Success is the sum of small efforts, repeated day in and day out." });
    }
  });

  // --- Vite Integration ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
