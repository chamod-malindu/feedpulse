# FeedPulse — AI-Powered Product Feedback Platform

<div align="center">

![FeedPulse Logo](frontend/public/logo.svg)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-green?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-white?style=for-the-badge&logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-orange?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=for-the-badge&logo=docker)](https://docker.com/)
[![Jest](https://img.shields.io/badge/Tested_with-Jest-C21325?style=for-the-badge&logo=jest)](https://jestjs.io/)

**A full-stack, AI-powered platform for collecting, analyzing, and prioritizing user feedback.**

</div>

## Table of Contents

- [What Is FeedPulse?](#what-is-feedpulse)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How to Run Locally](#how-to-run-locally)
- [Running with Docker](#running-with-docker)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Running Tests](#running-tests)
- [Database Schema](#database-schema)
- [Security](#security)
- [Git Workflow](#git-workflow)
- [Design](#design)
- [What I Would Build Next](#what-i-would-build-next)
- [Assignment Requirements Coverage](#assignment-requirements-coverage)
- [Troubleshooting](#troubleshooting)

---

## What Is FeedPulse?

FeedPulse is a lightweight internal tool that lets teams collect product feedback and feature requests from users, then uses **Google Gemini AI** to automatically categorise, prioritise, and summarise them — giving product teams instant clarity on what to build next.

### The Problem It Solves

Product teams receive feedback from many sources. Reading, sorting, and prioritising hundreds of feedback items by hand takes too much time. FeedPulse uses AI to do this automatically, so the team can quickly see what matters most.

---

## Architecture

![FeedPulse Architecture](frontend/public/feedpulse-architecture.jpg)

### Architecture Description
FeedPulse follows a classic **client-server architecture** with a clear separation between
the frontend, backend, and external services.

**Frontend (Next.js - Port 3000)**
Built with Next.js 16 and React 19, using the App Router for both server-side and
client-side rendering. The UI layer is composed of three pages - a public feedback
form, an admin login page, and a JWT-protected dashboard. All HTTP communication
with the backend is centralised in a single `api.ts` client, keeping API logic separate
from UI components.

**Backend API (Express.js - Port 4000)**
The backend is a structured Express 5 + TypeScript server organised into four layers:

- **Routes Layer** - maps incoming requests to the correct handler (`/api/feedback`,
  `/api/auth`, `/api/health`)
- **Middleware Layer** - every request passes through JWT authentication,
  input validation (express-validator), rate limiting, Helmet security headers,
  and CORS checks before reaching a controller
- **Controller Layer** - contains the business logic for feedback CRUD operations
  and admin authentication, including bcryptjs password hashing
- **Service Layer** - the `gemini.service.ts` handles all communication with the
  Google Gemini API, including automatic retry with exponential backoff on
  rate-limit errors (HTTP 429)

**Data Layer (MongoDB 7)**
Mongoose models define strict schemas for the `feedbacks` and `users` collections.
Dedicated indexes on `status`, `category`, `ai_priority`, `createdAt`, and a
full-text index on `title` + `ai_summary` ensure fast filtering, sorting, and
keyword search on the admin dashboard.

**External Services**
The backend acts as the sole intermediary for two external dependencies:

- **MongoDB Atlas** - stores all feedback documents and admin credentials
- **Google Gemini 2.5 Flash** - receives feedback text via a structured prompt
  and returns AI analysis (category, sentiment, priority score, summary, and tags).
  Analysis runs asynchronously after submission so the user receives an instant
  response regardless of Gemini's availability. If the AI call fails, the feedback
  is still saved and flagged for retry.

---

## Screenshots

### Landing Page — Public Feedback Form
![Landing Page](frontend/public/screenshots/landingPage.png)

### Admin Dashboard — Feedback Management
![Admin Dashboard](frontend/public/screenshots/adminDashboard.png)

### AI Trend Summary
![AI Summary](frontend/public/screenshots/aiSummary.png)

---

## Features

### Public (No Login Required)
- Clean feedback submission form
- Fields: Title, Description, Category, Name (optional), Email (optional)
- Client-side validation with instant error messages
- Character counter on description field
- Success and error states shown after submission
- Rate limiting: maximum 5 submissions per hour per IP

### AI Analysis (Automatic)
- Every submission is analysed by Google Gemini 2.5 Flash in the background
- AI detects: category, sentiment, priority score (1–10), summary, and tags
- Feedback is saved instantly - AI failure never blocks submission
- Automatic retry with exponential backoff on Gemini rate limits (429)
- Admin can manually re-trigger AI analysis on any item

### Admin Dashboard (Login Required)
- Protected with JWT authentication
- Real-time stats bar: total feedback, open items, average priority, top tag
- Filter by category (Bug / Feature Request / Improvement / Other)
- Filter by status (New / In Review / Resolved)
- Sort by date or priority
- Search by keyword (searches title and AI summary)
- Paginated results (10 items per page)
- Update status of any feedback item
- Delete feedback items
- On-demand AI trend summary (top 3 themes from last 7 days)
- Re-trigger AI analysis on any item
- Toast notifications via Sonner for user actions

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js, React, TypeScript | 16, 19, 5 | UI framework with App Router |
| **UI Components** | ShadCN UI, Radix UI, Lucide React | Latest | Accessible components and icons |
| **Styling** | Tailwind CSS | v4 | Utility-first CSS with custom brand theme |
| **Notifications** | Sonner | 2.x | Toast notifications |
| **Backend** | Node.js, Express.js, TypeScript | 20, 5, 6 | REST API server |
| **Database** | MongoDB, Mongoose | 7, 9 | Document storage with schemas |
| **AI** | Google Gemini 2.5 Flash | Latest | Feedback analysis and trend summaries |
| **Authentication** | JWT (jsonwebtoken), bcryptjs | Latest | Secure admin login |
| **Validation** | express-validator | 7.x | Server-side input sanitisation |
| **Rate Limiting** | express-rate-limit | 8.x | Prevent spam submissions |
| **Security** | Helmet.js, CORS | Latest | HTTP security headers |
| **Testing** | Jest, Supertest, ts-jest | 30, 7, 29 | Backend unit and integration tests |
| **DevOps** | Docker, Docker Compose | Latest | Containerised deployment |

---

## Project Structure

```
feedpulse/
│
├── backend/
│   ├── src/
│   │   ├── server.ts                   Entry point - starts Express + MongoDB
│   │   ├── app.ts                      Express setup, middleware, and routes
│   │   ├── config/
│   │   │   └── database.ts             MongoDB connection with Mongoose
│   │   ├── controllers/
│   │   │   ├── feedback.controller.ts  Feedback CRUD + AI trigger logic
│   │   │   └── auth.controller.ts      Admin login with JWT token generation
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts       JWT verification guard
│   │   │   ├── validation.middleware.ts express-validator rules
│   │   │   └── rateLimiter.middleware.ts Rate limiting (5/hr submit, 100/15min general)
│   │   ├── models/
│   │   │   ├── feedback.model.ts       Feedback schema, indexes, and TypeScript interface
│   │   │   └── user.model.ts           User schema with bcrypt password hashing
│   │   ├── routes/
│   │   │   ├── feedback.routes.ts      Feedback API routes (public + admin)
│   │   │   └── auth.routes.ts          Auth API routes
│   │   ├── services/
│   │   │   └── gemini.service.ts       Gemini AI integration with retry logic
│   │   ├── utils/
│   │   │   └── response.ts            Consistent JSON response helpers
│   │   ├── scripts/
│   │   │   └── seed-admin.ts          Creates default admin user
│   │   └── __tests__/
│   │       ├── feedback.test.ts       API endpoint tests (submit, update, validation)
│   │       └── gemini.test.ts         Gemini parsing, retry, and edge case tests
│   ├── .dockerignore
│   ├── .env.example                   Environment variable template
│   ├── .env.test.example              Test environment template
│   ├── Dockerfile
│   ├── jest.config.js                 Jest + ts-jest configuration
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx             Root layout, metadata, fonts, Toaster
│   │   │   ├── globals.css            Tailwind v4 + ShadCN + brand theme
│   │   │   ├── page.tsx               Landing page with public feedback form
│   │   │   ├── login/
│   │   │   │   └── page.tsx           Admin login page
│   │   │   └── dashboard/
│   │   │       └── page.tsx           Admin dashboard (JWT-protected)
│   │   ├── components/
│   │   │   ├── ui/                    ShadCN components (13 components)
│   │   │   │   ├── alert.tsx          badge.tsx, button.tsx, card.tsx
│   │   │   │   ├── dropdown-menu.tsx  input.tsx, label.tsx, select.tsx
│   │   │   │   ├── separator.tsx      skeleton.tsx, sonner.tsx
│   │   │   │   └── table.tsx          textarea.tsx
│   │   │   ├── FeedbackForm.tsx       Public submission form with validation
│   │   │   ├── FeedbackCard.tsx       Single feedback item with AI badges
│   │   │   └── StatsBar.tsx           Dashboard statistics summary cards
│   │   └── lib/
│   │       ├── api.ts                 Centralised API client (all backend calls)
│   │       └── utils.ts               ShadCN cn() utility
│   ├── .dockerignore
│   ├── .env.local.example
│   ├── components.json                ShadCN UI configuration
│   ├── eslint.config.mjs              ESLint flat config
│   ├── Dockerfile
│   ├── next.config.ts
│   ├── postcss.config.mjs
│   └── package.json
│
├── docker-compose.yml                 Multi-container orchestration
├── .gitignore
└── README.md
```

---

## How to Run Locally

### Prerequisites

Make sure you have the following installed:

- [Node.js 20+](https://nodejs.org/) and npm
- [Git](https://git-scm.com/)
- A MongoDB database - either:
  - [MongoDB Atlas](https://www.mongodb.com/atlas) (free cloud, recommended)
  - [MongoDB Community Server](https://www.mongodb.com/try/download/community) (local)
- A Google Gemini API key - free at [aistudio.google.com](https://aistudio.google.com)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/feedpulse.git
cd feedpulse
```

---

### Step 2: Set Up the Backend

```bash
cd backend
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Open `backend/.env` and fill in your values:

```env
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/feedpulse
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_super_secret_key_change_this_in_production
NODE_ENV=development
```

---

### Step 3: Set Up the Frontend

```bash
cd ../frontend
npm install
```

Create the environment file:

```bash
cp .env.local.example .env.local
```

The `.env.local` file should contain:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

> This value is already correct for local development. No changes needed.

---

### Step 4: Seed the Admin User

```bash
cd ../backend
npm run seed
```

This creates the following admin account in your database:

| Field | Value |
|-------|-------|
| **Email** | `admin@feedpulse.com` |
| **Password** | `admin123` |

> ⚠️ The password is automatically hashed using bcryptjs before being stored. It is never saved as plain text.

---

### Step 5: Start Both Servers

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
MongoDB connected successfully
Server running on port 4000
Environment: development
API: http://localhost:4000/api/health
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
▲ Next.js 16.x.x
- Local: http://localhost:3000
✓ Ready
```

---

### Step 6: Open the App

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Public feedback form |
| `http://localhost:3000/login` | Admin login |
| `http://localhost:3000/dashboard` | Admin dashboard |
| `http://localhost:4000/api/health` | Backend health check |

---

## Running with Docker

Docker lets you run the entire application with a single command - no manual setup required.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Step 1: Set Your Environment Variables

Create a `.env` file in the project root (/feedpulse):

```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_super_secret_key_here
```

### Step 2: Build and Start All Services

```bash
docker-compose up --build
```

This starts three containers:

| Container | Port | Description |
|-----------|------|-------------|
| `feedpulse-mongo` | 27017 | MongoDB 7 with healthcheck |
| `feedpulse-backend` | 4000 | Express API (waits for healthy MongoDB) |
| `feedpulse-frontend` | 3000 | Next.js UI (depends on backend) |

### Step 3: Seed the Admin User

In a new terminal while the containers are running:

```bash
docker-compose exec backend npm run seed
```

### Step 4: Open the App

Visit `http://localhost:3000`

### Stop All Services

```bash
docker-compose down
```

> To also delete the database data: `docker-compose down -v`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Backend server port (default: `4000`) | `4000` |
| `MONGO_URI` | **Yes** | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/feedpulse` |
| `GEMINI_API_KEY` | **Yes** | Google Gemini API key from aistudio.google.com | `AIzaSy...` |
| `JWT_SECRET` | **Yes** | Secret key for signing JWT tokens | `your-very-long-random-string` |
| `NODE_ENV` | No | Environment mode | `development` or `production` |

### Backend Testing (`backend/.env.test`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGO_URI` | **Yes** | Separate test MongoDB URI | `mongodb://localhost:27017/feedpulse-test` |
| `JWT_SECRET` | **Yes** | JWT secret for test environment | `test-secret` |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | **Yes** | URL of the backend API | `http://localhost:4000/api` |

> **Security Note:** Never commit `.env` or `.env.local` files to GitHub. They are listed in `.gitignore`. Use `.env.example` and `.env.local.example` as templates.

---

## API Reference

### Public Endpoints

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `POST` | `/api/feedback` | Submit new feedback | 5 per hour per IP |
| `GET` | `/api/health` | Check if API is running | None |

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Admin login - returns JWT token |

### Admin Endpoints (JWT Required)

All admin endpoints require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/feedback` | Get all feedback with filters and pagination |
| `GET` | `/api/feedback/stats` | Get dashboard statistics (MongoDB aggregation) |
| `GET` | `/api/feedback/summary` | Get AI trend summary for last 7 days |
| `GET` | `/api/feedback/:id` | Get a single feedback item |
| `PATCH` | `/api/feedback/:id` | Update feedback status |
| `DELETE` | `/api/feedback/:id` | Delete a feedback item |
| `POST` | `/api/feedback/:id/reanalyse` | Re-trigger Gemini AI analysis |

### Request and Response Format

**Submit Feedback:**
```json
POST /api/feedback
{
  "title": "Add dark mode to the dashboard",
  "description": "It would be really helpful to have a dark mode option for better usability at night and in low-light conditions.",
  "category": "Feature Request",
  "submitterName": "Chamod Malindu",
  "submitterEmail": "chamod@example.com"
}
```

**All Responses follow this format:**
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "message": "Feedback submitted successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": [
    { "field": "description", "message": "Description must be at least 20 characters" }
  ],
  "message": "Validation failed"
}
```

### Query Parameters for `GET /api/feedback`

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number | `?page=2` |
| `limit` | number | Items per page (default: 10) | `?limit=10` |
| `category` | string | Filter by category | `?category=Bug` |
| `status` | string | Filter by status | `?status=New` |
| `sort` | string | Sort field (prefix for descending) | `?sort=-ai_priority` |
| `search` | string | Regex search on title and AI summary | `?search=dark+mode` |

---

## Running Tests

```bash
cd backend
cp .env.test.example .env.test   # First time only - set test MongoDB URI
npm test
```

Tests run against a **separate test database** to avoid affecting development data.

### Test Coverage

| Suite | File | Tests |
|-------|------|-------|
| **Feedback API** | `feedback.test.ts` | Valid submission, empty title, short description, invalid category, status update with auth, invalid status rejection |
| **Auth Middleware** | `feedback.test.ts` | No token → 401, invalid token → 401, valid token → pass |
| **Gemini Service** | `gemini.test.ts` | JSON parsing, markdown cleaning, priority clamping (1–10), field validation, retry on 429 |

### Running Tests in Watch Mode

```bash
cd backend
npx jest --watch
```

---

## Database Schema

### Feedback Collection

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `title` | String | Yes | Max 120 chars, trimmed | Feedback title |
| `description` | String | Yes | Min 20 chars (server), Max 200 chars (schema) | Detailed description |
| `category` | Enum | Yes | Bug, Feature Request, Improvement, Other | User-selected category |
| `status` | Enum | No | New (default), In Review, Resolved | Admin-managed status |
| `submitterName` | String | No | Trimmed | Optional submitter name |
| `submitterEmail` | String | No | Email regex, lowercase | Optional email |
| `ai_category` | String | No | — | AI-detected category |
| `ai_sentiment` | Enum | No | Positive, Neutral, Negative | AI sentiment analysis |
| `ai_priority` | Number | No | 1 (low) to 10 (critical) | AI priority score |
| `ai_summary` | String | No | — | One-sentence AI summary |
| `ai_tags` | Array | No | Max 5 tags | AI-generated keyword tags |
| `ai_processed` | Boolean | No | Default: `false` | `true` after successful AI analysis |
| `createdAt` | Date | Auto | — | Auto-managed by Mongoose |
| `updatedAt` | Date | Auto | — | Auto-managed by Mongoose |

### Database Indexes

| Index | Type | Purpose |
|-------|------|---------|
| `{ status: 1 }` | Single | Fast status filtering |
| `{ category: 1 }` | Single | Fast category filtering |
| `{ ai_priority: -1 }` | Single | Sort by priority (descending) |
| `{ createdAt: -1 }` | Single | Sort by newest first |
| `{ status: 1, category: 1 }` | Compound | Combined filter queries |
| `{ title: 'text', ai_summary: 'text' }` | Text | Text index (search uses regex in controller) |

### User Collection

| Field | Type | Description |
|-------|------|-------------|
| `email` | String | Unique admin email |
| `password` | String | bcrypt-hashed password |
| `role` | `enum('admin')` | User role for authorization |
| `createdAt` | Date | Auto-managed |

---

## Security

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| **Helmet.js** | HTTP security headers | Prevents XSS, clickjacking, MIME sniffing |
| **CORS** | Whitelist-based origin checking | Only allows `localhost:3000` and Docker origins |
| **JWT** | Signed tokens with secret key | Stateless admin authentication |
| **bcryptjs** | Password hashing | Passwords never stored in plain text |
| **Rate Limiting** | 5 submissions/hr per IP | Prevents spam on public feedback form |
| **Input Validation** | express-validator | Server-side sanitisation of all inputs |
| **Request Size Limit** | `express.json({ limit: '10kb' })` | Prevents payload attacks |
| **Environment Variables** | `.env` files in `.gitignore` | Secrets never committed to version control |

---

## Git Workflow

This project uses a professional branching strategy:

```
main          ← Production-ready code (final merge only)
  ↑
develop       ← Integration branch (all features merge here)
  ↑
feature/*     ← Individual feature branches
```

### Branch History

| Branch | Purpose |
|--------|---------|
| `feature/database-schemas` | Mongoose models and database connection |
| `feature/backend-api` | Express REST API with all endpoints |
| `feature/gemini-ai` | Google Gemini AI integration |
| `feature/feedback-stats` | MongoDB aggregation stats endpoint |
| `feature/frontend-submission` | Public landing page, frontend UI setup, Shadcn and feedback form |
| `feature/admin-dashboard` | Admin login and dashboard |
| `feature/unit-tests` | Jest and Supertest unit tests |
| `feature/docker-setup` | Docker and docker-compose setup |
| `feature/readme` | This README and screenshots |

---

## Design

| Element | Value |
|---------|-------|
| **Primary colour** | `#0ba5ec` (bright blue) |
| **Accent colour** | `#00d4ff` (cyan gradient) |
| **Dark colour** | `#0f1f3f` (navy for headings and footer) |
| **Button style** | Blue to cyan gradient, pill-shaped (fully rounded) |
| **Card style** | White, soft shadow, rounded corners |
| **Backgrounds** | Light blue gradient (`#e8f4fd` -> `#ffffff` -> `#e0f7ff`) |
| **Section labels** | Small uppercase pills with blue dot |
| **Fonts** | Geist Sans, Geist Mono, Inter (via `next/font/google`) |
| **Notifications** | Sonner toast (top-right, rich colours) |

---

## What I Would Build Next

Given more time, these are the features I would add:

| Priority | Feature | Description |
|----------|---------|-------------|
| 🔴 High | **Email notifications** | Notify submitters when their feedback status changes |
| 🔴 High | **Feedback voting** | Let users upvote existing feedback to indicate demand |
| 🔴 High | **Real-time updates** | WebSockets so the dashboard updates live without refreshing |
| 🟡 Medium | **Role-based access control** | Multiple admin roles with different permission levels |
| 🟡 Medium | **Export to CSV** | Allow admin to download all feedback as a spreadsheet |
| 🟡 Medium | **Webhook integrations** | Post to Slack or Discord when high-priority feedback arrives |
| 🟡 Medium | **Analytics dashboard** | Charts and trends over time using chart libraries |
| 🟢 Low | **Queue system** | Redis/Bull for more robust AI processing under high load |
| 🟢 Low | **Multi-product support** | Different teams with their own feedback boards |
| 🟢 Low | **User authentication** | Allow users to track their own submitted feedback |

---

## Assignment Requirements Coverage

### Must Have ✅

- [x] Public page where users can submit feedback without signing in
- [x] Form fields: Title, Description, Category, Name (optional), Email (optional)
- [x] Client-side form validation - no empty titles, minimum 20 characters in description
- [x] POST to Node.js backend API and save to MongoDB
- [x] Success and error states shown after submission
- [x] Call Gemini API when new feedback is submitted
- [x] Store all AI fields on the feedback document
- [x] Handle Gemini errors gracefully - feedback saved even if AI fails
- [x] Show badge on each feedback card
- [x] Protected dashboard - only accessible after logging in
- [x] Table/card list with title, category, sentiment badge, priority score, date
- [x] Filter feedback by category
- [x] Filter feedback by status
- [x] Admin can update the status of any feedback item
- [x] All required REST API endpoints
- [x] Consistent JSON response format
- [x] Mongoose schemas with proper field types and validations
- [x] Admin routes protected by JWT middleware
- [x] Environment variables for all secrets
- [x] Input sanitisation - reject bad input before saving to DB
- [x] Proper HTTP status codes
- [x] Separate route, controller, and model files
- [x] Feedback schema matches the spec with all required fields and types
- [x] MongoDB indexes on status, category, ai_priority, createdAt
- [x] Timestamps enabled (createdAt, updatedAt)
- [x] Public GitHub repository
- [x] Complete README.md
- [x] .gitignore includes node_modules, .env, build output
- [x] Meaningful commit messages
- [x] At least 5 commits spread across the project

### Nice to Have ✅

- [x] Character counter on description field
- [x] Rate limiting - 5 submissions per hour per IP
- [x] AI weekly/on-demand summary
- [x] Admin can manually re-trigger AI analysis
- [x] Sort feedback by date and priority score
- [x] Search feedback by keyword
- [x] Stats bar at the top
- [x] Paginated results (10 items per page)
- [x] Separate User collection for admin credentials
- [x] The README includes a short note on what I would build next if I had more time
- [x] GitHub branches used

### Bonus ✅

- [x] Docker and docker-compose setup
- [x] Unit tests with Jest and Supertest

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| **MongoDB connection failed** | Check that your `MONGO_URI` is correct and the database is accessible. For Atlas, whitelist your IP address. |
| **Gemini API returns 429** | Free-tier rate limit hit. The app auto-retries with exponential backoff (30s → 60s → 120s). Wait a minute and retry. |
| **CORS error in browser** | Ensure frontend is running on `http://localhost:3000` and backend on `http://localhost:4000`. |
| **JWT token invalid** | Token may have expired. Log in again at `/login` to get a new token. |
| **Docker build fails** | Ensure Docker Desktop is running. Try `docker-compose down -v` then `docker-compose up --build`. |
| **Tests fail with connection error** | Ensure `backend/.env.test` has a valid `MONGO_URI` pointing to a test database. |
| **`npm run seed` fails** | Make sure MongoDB is running and `MONGO_URI` in `.env` is correct. |

---

<div align="center">

Built with Next.js · Node.js · MongoDB · Google Gemini AI

</div>
