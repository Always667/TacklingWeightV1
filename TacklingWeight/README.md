# Tackling Weight – Health & Wellness App

A safe, modern web app that helps users manage weight through general wellness guidance.  
**This is NOT a medical platform.** All advice aligns with WHO, Public Health England, and British Nutrition Foundation guidelines.

---

## Features

- **Authentication** – Register, login, logout with JWT (httpOnly cookies) + bcrypt
- **User Profile** – Email, alias, height, starting weight, goal (lose/gain/maintain)
- **BMI Calculator** – Auto-computed from height & latest weight, with WHO category
- **Weight Tracking** – Log weigh-ins, view progress on a Chart.js line graph
- **Challenges** – Daily (yes/no) and weekly (weight-verified) challenges with point awards
- **Leaderboard** – Weekly and all-time rankings based on challenge points
- **AI Advice (Rule-Based)** – Safe wellness tips, meal ideas, workout plans, safer swaps — no LLM, no supplements, no medical claims
- **Data Deletion** – Full GDPR-style data removal endpoint
- **Rate Limiting** – Applied to advice and challenge submission endpoints

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | HTML, TailwindCSS (CDN), Chart.js |
| Backend   | Node.js, Express                  |
| Database  | MongoDB Atlas (Mongoose)          |
| Auth      | JWT (httpOnly cookies), bcrypt    |
| Testing   | Jest, Supertest                   |

---

## Project Structure

```
TacklingWeight/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   ├── rateLimiter.js        # Rate limiting
│   │   └── validate.js           # Input validation
│   ├── models/                   # Mongoose schemas
│   ├── routes/                   # Express routes
│   ├── services/
│   │   ├── adviceEngine.js       # Rule-based advice
│   │   └── leaderboardService.js # Points & rankings
│   ├── tests/                    # Jest test suites
│   ├── seed.js                   # Demo data seeder
│   ├── server.js                 # App entry point
│   └── package.json
├── frontend/
│   ├── index.html                # Single-page app
│   └── js/
│       ├── api.js                # API client
│       └── app.js                # App logic & UI
├── README.md
└── .gitignore
```

---

## Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/TacklingWeight.git
cd TacklingWeight/backend
npm install
```

### 2. Configure Environment

```bash
cp .env.sample .env
```

Edit `.env` with your values:

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/tacklingweight
JWT_SECRET=your_secure_random_string_at_least_32_chars
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Seed Demo Data

```bash
npm run seed
```

Demo credentials:
- `alice@example.com` / `password123`
- `bob@example.com` / `password123`
- `charlie@example.com` / `password123`

### 4. Run Backend

```bash
npm run dev
```

Server starts at `http://localhost:5000`

### 5. Serve Frontend

Open `frontend/index.html` in a browser, or use a local server:

```bash
cd ../frontend
npx serve .
```

Frontend at `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint                  | Auth | Description                    |
|--------|---------------------------|------|--------------------------------|
| POST   | /auth/register            | No   | Register new user              |
| POST   | /auth/login               | No   | Login                          |
| POST   | /auth/logout              | No   | Logout (clear cookie)          |
| GET    | /profile                  | Yes  | Get user profile               |
| PATCH  | /profile                  | Yes  | Update profile fields          |
| GET    | /weighins                 | Yes  | List user weigh-ins            |
| POST   | /weighins                 | Yes  | Add a weigh-in                 |
| GET    | /progress/summary         | Yes  | BMI, chart data, stats         |
| POST   | /advice                   | Yes  | Get wellness advice (rate-limited) |
| GET    | /challenges/active        | Yes  | List active challenges         |
| POST   | /challenges/:id/submit    | Yes  | Submit challenge (rate-limited) |
| GET    | /leaderboard?period=...   | Yes  | Get leaderboard                |
| DELETE | /user/data                | Yes  | Delete all user data           |

---

## Running Tests

```bash
cd backend
npm test
```

Tests cover:
- Auth (register, login, logout, validation)
- Weigh-ins (CRUD, validation, auth)
- Challenge submission (yesno, weight-verified, duplicates)
- Advice engine guardrails (blocked terms, disclaimer, vegetarian swaps)

---

## Safety & Guardrails

The advice engine **never** provides:
- Medical advice, diagnosis, or treatment
- Supplement recommendations
- Extreme diet guidance (keto, detox, fasting)
- Disease-related advice

All advice output includes a mandatory disclaimer:
> "This advice is for general health guidance only and is not medical advice."

---

## Deployment

### Backend (Render / Railway)
1. Push code to GitHub
2. Create a new Web Service on Render
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variables from `.env`

### Frontend (Vercel / Netlify)
1. Deploy the `frontend/` directory
2. Update `API_BASE` in `js/api.js` to your backend URL

---

## License

MIT
