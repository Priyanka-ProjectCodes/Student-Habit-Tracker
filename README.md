# HabitHero: Student Habit Tracker

A modern, gamified habit tracking application designed for students and teachers.

## Features

### For Students
- **Daily Habit Tracking**: Log study hours, reading, exercise, and sleep.
- **Gamification**: Earn XP, level up, and maintain streaks (🔥).
- **Analytics**: Visualize progress with interactive charts.
- **Motivational Quotes**: AI-powered motivation via Gemini.
- **Profile Management**: Track academic details like roll number and department.

### For Teachers/Admins
- **Student Management**: Add, edit, or remove students.
- **Attendance Tracking**: Mark and monitor student attendance.
- **Performance Reports**: View detailed habit reports for each student.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Recharts, Motion.
- **Backend**: Node.js, Express, JWT Auth.
- **Database**: SQLite (Better-SQLite3).
- **AI**: Google Gemini API.

## Setup & Running

1. **Environment Variables**:
   - Create a `.env` file (or use the platform's Secrets panel).
   - Add `GEMINI_API_KEY`.
   - Add `JWT_SECRET` (any secure string).

2. **Installation**:
   ```bash
   npm install
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

4. **Production**:
   ```bash
   npm run build
   npm start
   ```

## Common Issues
- **Database Locked**: Ensure only one instance of the app is running.
- **JWT Errors**: Check if `JWT_SECRET` is set correctly.
- **Vite/HMR**: HMR is disabled by default in this environment; refresh manually if needed.
