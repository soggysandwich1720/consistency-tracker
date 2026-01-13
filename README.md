# Consistency Tracker

A minimal, personal consistency and daily task tracking web app focused on
long-term discipline rather than gamification.

🚀 **Live Preview:** [[__](https://visionary-chimera-fbbeda.netlify.app)](https://visionary-chimera-fbdeda.netlify.app/)

---

## ✨ Features
- Fixed daily tasks
- One-time and repeatable task tracking
- Priority levels (low / medium / high)
- Optional timers for tasks
- Daily completion percentage
- Weekly & monthly consistency averages
- Minimal dark UI
- Automatic carry-over of unfinished tasks

---

## 🛠 Tech Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Hosting:** Netlify (frontend), Render/Railway (backend)

---

## 📊 Consistency Logic
- Daily completion = completed tasks / total tasks
- Weekly completion = average of daily completion %
- Monthly completion = average of daily completion %

---

## 🚧 Status
This project is under active development.

---

## 📦 Local Setup

```bash
# install dependencies
npm install

# start frontend
npm run dev
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
