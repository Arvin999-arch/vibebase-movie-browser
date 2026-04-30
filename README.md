# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# VibeBase Movie Browser

## Description
A full-stack movie browsing application where users can discover movies, create watchlists, and rate films.

## Tech Stack
- **Frontend**: React, React Router, CSS
- **Backend**: Node.js, Express, JWT
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing

## Features
- User registration and login (JWT authentication)
- Browse popular movies from TMDB API
- Search movies by title
- View detailed movie information
- Add movies to watchlist and favorites
- Rate and review movies
- Responsive design

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- TMDB API key

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Add your DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npm run dev
