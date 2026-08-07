# CampusConnect — College Management System

A full-stack college management system supporting three roles — **Admin**,
**Faculty**, and **Student** — built on the MERN stack (MongoDB, Express,
React, Node.js).

## Tech stack

| Layer          | Technology                                   |
|----------------|-----------------------------------------------|
| Frontend       | React + Vite + Tailwind CSS                   |
| Backend        | Node.js + Express                             |
| Database       | MongoDB (Mongoose)                            |
| Auth           | JWT, bcrypt password hashing                  |
| File upload    | Cloudinary (profile pictures)                 |
| Charts         | Chart.js (via react-chartjs-2)                |
| Email          | Nodemailer (password reset only)              |
| Deployment     | Vercel (frontend) · Render (backend) · MongoDB Atlas (database) |

## Features

- **Auth**: JWT login, self-registration (students), forgot/reset/change
  password, protected + role-based routes.
- **Admin**: manage students, faculty, departments, and courses (with
  faculty assignment); build the timetable; post notices; manage fee
  records; dashboard with stat cards and charts (attendance trend,
  department-wise students, gender ratio, and a placement-stats chart that
  uses mock data — no placement module exists behind it).
- **Faculty**: view assigned subjects, mark attendance per class, upload
  Mid Sem / End Sem / Practical marks, view the timetable, view notices.
- **Student**: view attendance % and marks, view the timetable, view/pay
  fees, view notices, edit profile (including a photo upload), dashboard
  with attendance %, CGPA, today's classes, and recent notices.

## Project structure

```
cms/
├── backend/
│   ├── config/          # DB and Cloudinary config
│   ├── middleware/       # JWT auth, role checks, file upload
│   ├── models/           # Mongoose schemas
│   ├── routes/           # One file per resource
│   ├── seed/seed.js       # Demo data script
│   └── server.js
└── frontend/
    └── src/
        ├── components/    # Sidebar, Topbar, Modal, StatCard, route guard
        ├── context/       # AuthContext
        ├── pages/         # One file per screen
        └── services/api.js # Axios instance with auth interceptor
```

## Running it locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env       # fill in your own MongoDB URI, JWT secret, Cloudinary + SMTP creds
npm run seed                # optional: populates demo departments/users/courses
npm run dev                  # starts on http://localhost:5000
```

Demo logins created by the seed script:
| Role    | Email                          | Password     |
|---------|----------------------------------|--------------|
| Admin   | admin@campusconnect.edu         | Admin@123    |
| Faculty | ritu.sharma@campusconnect.edu   | Faculty@123  |
| Student | cse23001@campusconnect.edu      | Student@123  |

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                  # starts on http://localhost:5173
```

Create a `.env` in `frontend/` if your API isn't on the default URL:
```
VITE_API_URL=http://localhost:5000/api
```

### Third-party accounts needed to use every feature

- **MongoDB**: a local instance, or a free MongoDB Atlas cluster.
- **Cloudinary**: free account → cloud name, API key, API secret (for
  profile picture uploads).
- **SMTP provider**: a Gmail account with an App Password, or a free
  Mailtrap/Resend account (for the forgot-password email).

The app runs fine without these for everything except those two specific
features.

## Deployment notes

- **Frontend → Vercel**: set the root directory to `frontend`, framework
  preset Vite, and add `VITE_API_URL` pointing at your deployed backend.
- **Backend → Render**: set the root directory to `backend`, start command
  `npm start`, and add all variables from `.env.example` (with
  `CLIENT_ORIGIN` set to your deployed frontend URL for CORS).
- **Database → MongoDB Atlas**: create a free cluster, whitelist Render's
  IP (or `0.0.0.0/0` for simplicity), and use the connection string as
  `MONGO_URI`.

## Notes for the internship presentation / resume

- The **placement statistics** chart on the admin dashboard uses
  hardcoded sample data — there's no placement-tracking module behind it,
  by design (out of scope for this build).
- **Assignments** and **leave requests** were scoped out — they don't
  exist anywhere in the app, including the dashboards.
- **Result PDF export** is not implemented — marks are viewable in the
  app only.
- Suggested resume bullet:
  *"Built CampusConnect, a full-stack MERN college management system with
  JWT auth, role-based access for admin/faculty/student, and modules for
  attendance, marks, fees, timetabling, and a notice board; deployed on
  Vercel/Render with MongoDB Atlas."*
