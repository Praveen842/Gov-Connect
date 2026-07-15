# 🏛️ GovExam Connect

**AI-Powered Government Examination Notification Portal**

GovExam Connect is a full-stack web application that aggregates official notifications from India's top government examination boards — **SSC, UPSC, RRB, and IBPS** — into a single, candidate-friendly dashboard. It features an intelligent notification engine that extracts and displays structured insights from raw government data, helping millions of aspirants stay informed.

---

## ✨ Features

### 🔔 Live Notification Scraping
- Automated scrapers fetch real-time notifications from official government APIs
- Supports **SSC**, **UPSC**, **RRB**, **IBPS** and more
- Runs on server startup and can be scheduled via cron jobs

### 🤖 AI-Powered Notification Details
- Procedural intelligence engine extracts structured data from notifications
- Dynamically renders up to **17 information sections** per notification:
  - Summary & Key Highlights
  - Eligibility Criteria & Vacancy Details
  - Important Dates Timeline
  - Selection Process Flowchart
  - Application Process & Required Documents
  - Fee Structure, Salary, Job Location
  - Official Documents & Download Links
- Smart fallback: gracefully handles legacy plain-text descriptions

### 🔐 Authentication & Security
- JWT-based authentication with secure token management
- Password hashing with **bcrypt**
- **Forgot Password** flow with email-based reset links
- Stateless reset tokens (no database schema changes required)
- Email delivery via **Nodemailer** (Gmail SMTP / Ethereal for testing)

### 👤 Profile Management
- Editable candidate profile (Name, Phone, Preferences)
- Notification toggle with animated switch
- Real-time save with success/error feedback

### 🎨 Modern UI/UX
- Enterprise-grade responsive design
- Smooth animations with **Framer Motion**
- CSS Modules for scoped, maintainable styling
- Loading skeletons, breadcrumbs, and micro-interactions
- Full-width dashboard layout

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, Vite, Framer Motion, React Icons, CSS Modules |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JWT, bcrypt |
| **Email** | Nodemailer (Gmail SMTP) |
| **Scraping** | Axios (REST API interception) |

---

## 📁 Project Structure

```
govt-exam-portal/
├── backend/
│   ├── config/          # Database & scheduler config
│   ├── controllers/     # Route handlers (auth, exams, profile)
│   ├── middleware/       # JWT auth middleware
│   ├── models/          # Mongoose schemas (Candidate, ExamNotification, ExamSource)
│   ├── parsers/         # Board-specific scrapers (SSC, UPSC, RRB, IBPS)
│   ├── routes/          # Express route definitions
│   ├── services/        # Scraper orchestration service
│   ├── scripts/         # Utility & debug scripts
│   ├── server.js        # Entry point
│   └── .env             # Environment variables (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI (PageShell, ExamCard, Navbar)
│   │   ├── context/     # AuthContext for global state
│   │   ├── pages/       # All page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ExamDetails.jsx      # AI-powered 17-section renderer
│   │   │   ├── ExamBoardPage.jsx
│   │   │   ├── Profile.jsx          # Editable profile dashboard
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── services/    # API service layer (auth, exams, profile)
│   │   ├── routes/      # React Router configuration
│   │   └── styles/      # Global CSS
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally on port `27017`
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/Praveen842/Gov-Connect.git
cd Gov-Connect

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/govt_exam_portal
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000

# For password reset emails (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

> **Note:** For Gmail, you need to enable 2-Step Verification and generate an [App Password](https://myaccount.google.com/apppasswords).

### Running the Application

```bash
# Terminal 1 — Start Backend
cd backend
npm start

# Terminal 2 — Start Frontend
cd frontend
npm run dev
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/candidate/register` | Register new candidate |
| POST | `/api/candidate/login` | Login & receive JWT |
| POST | `/api/candidate/forgot-password` | Send password reset email |
| POST | `/api/candidate/reset-password` | Reset password with token |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/candidate/profile` | Get candidate profile |
| PUT | `/api/candidate/profile` | Update candidate profile |

### Examinations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/candidate/boards` | List all exam boards |
| GET | `/api/candidate/exams` | Get all notifications |
| GET | `/api/candidate/exams/board/:board` | Get notifications by board |
| GET | `/api/candidate/exams/:id` | Get notification details |

---

## 🧠 How the AI Engine Works

GovExam Connect uses a **no-API-key, zero-cost AI simulation** approach:

1. **Backend Parser** (`sscParser.js`) analyzes notification titles using keyword matching
2. Generates a structured JSON object with 17+ fields (summary, eligibility, salary, etc.)
3. Stores the JSON as a string in the existing `description` database field
4. **Frontend** (`ExamDetails.jsx`) attempts `JSON.parse()` on the description
5. If valid JSON → renders the full 17-section interactive dashboard
6. If plain text → falls back to a simple text card

> This architecture is designed to be **future-proof**: when you integrate a real LLM (like Gemini or GPT), simply have it return the same JSON structure — the frontend will render it perfectly with zero code changes!

---

## 👨‍💻 Author

**Praveen** — [GitHub](https://github.com/Praveen842)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
