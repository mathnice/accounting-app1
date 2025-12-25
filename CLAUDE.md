# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

* 全程使用中文对话 (Use Chinese for all conversations)

## Project Overview

A cross-platform accounting application with web and mobile clients. The app provides transaction tracking, category management, account management, statistics, and data synchronization.

**Tech Stack:**
- **Backend**: Node.js + Express + SQLite (sql.js) + TypeScript
- **Web**: React + Ant Design + ECharts + TypeScript + Vite
- **Mobile**: React Native + Expo + TypeScript

**Important**: The project uses SQLite (via sql.js) as the database, NOT MongoDB as mentioned in older documentation. Data is stored in `backend/data/accounting.db`.

## Development Commands

### Backend (`backend/`)
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Development mode (port 3000)
npm run build        # Compile TypeScript
npm run start        # Production mode
npm run test         # Run tests
npm run lint         # Run ESLint
```

### Web (`web/`)
```bash
cd web
npm install          # Install dependencies
npm run dev          # Development mode (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Mobile (`mobile/`)
```bash
cd mobile
npm install          # Install dependencies
npm start            # Start Expo dev server
npm run android      # Run on Android emulator
npm run ios          # Run on iOS simulator (macOS only)
```

## Architecture

### Backend Structure (`backend/src/`)
```
app.ts              # Express app entry point
config/
  database.ts       # SQLite connection via sql.js
  index.ts          # Environment configuration
controllers/        # Request handlers
middlewares/        # Custom middleware (auth, cors, error handling)
models/            # Data models (SQLite wrappers)
routes/            # API route definitions
services/          # Business logic (AI, email, etc.)
utils/             # Utility functions
validators/        # Request validation schemas
```

**Key Architecture Details:**
- Uses `sql.js` for in-memory SQLite with periodic file persistence
- Database wrapper mimics `better-sqlite3` API (see `config/database.ts`)
- All authenticated endpoints require JWT token via `Authorization: Bearer <token>` header
- InsForge auth middleware extracts user from token and attaches to `req.user`

### Web Structure (`web/src/`)
```
App.tsx             # Root component with router
main.tsx            # Entry point
layouts/            # Layout components
pages/              # Page components (Dashboard, Transactions, etc.)
services/           # API client (axios)
stores/             # Zustand state management
```

### Mobile Structure (`mobile/src/`)
```
App.tsx             # Entry point
contexts/           # React contexts (AuthContext)
navigation/         # React Navigation configuration
screens/            # Screen components
services/           # API service
components/         # Reusable components
theme/              # Theme configuration
```

**Mobile API Configuration**: Edit `mobile/src/services/api.ts` to configure:
- Android Emulator: `http://10.0.2.2:3000/api`
- iOS Simulator: `http://localhost:3000/api`
- Physical device: Use your computer's IP address

## API Routes

All routes are prefixed with `/api`:

| Module | Routes | Description |
|--------|--------|-------------|
| `/users` | POST /register, POST /login, GET /profile, PUT /profile | User auth and profile |
| `/transactions` | GET /, POST /, PUT /:id, DELETE /:id, POST /batch/delete, POST /batch/export | CRUD operations |
| `/categories` | GET /, POST /, PUT /:id, DELETE /:id | Category management |
| `/accounts` | GET /, POST /, PUT /:id, DELETE /:id | Account management |
| `/statistics` | GET /summary, GET /category, GET /trend, POST /report | Statistics and reports |
| `/sync` | POST /push, GET /pull, POST /backup, POST /restore | Data sync/backup |
| `/ai` | POST /ask | AI assistance |
| `/verification` | POST /send, POST /verify | Email/SMS verification |

## Database Schema

**Tables**: `users`, `verification_codes`, `categories`, `accounts`, `transactions`

- All amounts are stored as integers (in cents, base unit is "分")
- Dates use ISO 8601 format
- User IDs are attached to most data for multi-tenancy

## Environment Configuration

Copy `backend/.env.example` to `backend/.env` and configure:

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: 3000) |
| `JWT_SECRET` | JWT signing key |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `AI_PROVIDER` | doubao, deepseek, or zhipu |
| `AI_API_KEY` | API key for AI service |
| `AI_BASE_URL` | Base URL for AI API |
| `SMTP_*` | Email configuration (optional) |

## AI Integration

The backend integrates with multiple AI providers (Doubao, DeepSeek, Zhipu) for intelligent transaction analysis. See `backend/src/services/aiService.ts` for implementation.

## Notes

- The backend uses sql.js which runs SQLite in-memory and periodically persists to disk
- Database file location: `backend/data/accounting.db`
- All monetary values are in cents (integer)
- Default user authentication is via email/password
