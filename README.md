# Easily — Job Portal (Node.js + Express + EJS)

A lightweight job portal built with Node.js, Express and EJS. Designed as a learning project and a simple recruiter/applicant workflow with protected resume uploads, recruiter-only controls, paginated listings, and real email confirmations (Gmail supported).

![Homepage](/docs/screenshots/01_home.png)

---

## Table of contents

# Easily — Job Portal

Easily is a compact, server-rendered job board built with Node.js, Express and EJS. It demonstrates a simple recruiter/applicant workflow with protected resume uploads and optional email confirmations.

Highlights

- Server-rendered EJS views
- Recruiter features: post/edit/delete jobs and view applicants
- Applicant features: apply with resume upload (stored in `uploads/resumes` and protected)
- Resume downloads restricted to the job poster
- Email confirmations via nodemailer (Gmail app password supported)

Run locally (short)

1. Install:

```powershell
npm install
```

2. Optionally set a session secret and SMTP credentials (PowerShell example):

```powershell
$env:SESSION_SECRET='change_this'
$env:SMTP_USER='your@gmail.com'
$env:SMTP_PASS='your_gmail_app_password'
```

3. Start and open `http://localhost:3000`

```powershell
npm start
# or
node index.js
```

Notes

- In-memory storage resets on restart; swap in a DB for persistence in production.
- If SMTP is not configured the app falls back to a test transport (Ethereal) for local email inspection.

Important files

- `index.js` — app entry
- `src/controllers/` — handlers (jobs, users)
- `src/middlewares/` — auth, validation, email
- `src/models/` — in-memory models
- `src/utils/mailer.js` — nodemailer helper
- `views/` — EJS templates
- `uploads/resumes/` — uploaded resumes (protected)

Security

- Resumes are not served from `public/`; downloads are gated to the job poster only.
- Duplicate or invalid applications result in immediate cleanup of uploaded files.
---

## File structure (important files)

```
src/
  controllers/
    job.controller.js        # main job & apply flow
    user.controller.js       # auth/registration
  middlewares/
    email.middleware.js      # sends confirmation email after apply
    jobpost.middleware.js    # validation rules
    lastVisit.js             # session/last-visit helper
  models/
    jobs.model.js            # in-memory jobs
    applicants.model.js      # in-memory applicants
    users.model.js           # in-memory users
  utils/
    mailer.js                # nodemailer helper (Gmail preference)
  views/                     # EJS templates
public/
  styles/index.css           # central styles
uploads/
  resumes/                   # protected resume storage (not public)
index.js                     # app entry
README.md
```

---

## Data models (in-memory summary)

- Users: basic objects with `email`, `name`, `role` (recruiter/applicant). Stored in `src/models/users.model.js`.
- Jobs: contains job fields + `posterEmail` and `applicants` count. Jobs are created by the logged-in user (poster).
- Applicants: each has `id`, `jobId`, `name`, `email`, `contact`, `resumepath`, `appliedOn`.

Note: The in-memory store resets on server restart. For production, swap in a DB (Mongo/Postgres) and persist uploads to cloud storage.

---

## Routes & UI overview

High-level routes (see `index.js` and controllers):

- GET `/` — homepage
- GET `/jobs` — job listings (search + pagination)
- GET `/jobdetails/:id` — job detail view
- POST `/apply/:id` — submit application (multipart/form-data), runs: upload -> save applicant -> send email -> render
- GET `/download-resume/:applicantId` — protected resume download (recruiter-only)
- GET `/postjob` & POST `/postjob` — post a new job (recruiter)
- GET `/postjob/:id` & POST `/postjob/:id` — edit job
- POST `/deletejob/:id` — delete job (recruiter-only)
- GET `/applicants/:jobId` — recruiter sees applicants for a job
- GET `/myjobs` — list jobs posted by logged-in recruiter
- Auth routes: `/login`, `/logout`, `/register` (implementation in `user.controller`)

Authorization: routes that modify data (post/edit/delete) check `req.session.userEmail` against `job.posterEmail` to enforce recruiter-only actions.

---

## Uploads & security

- Resumes are stored in `uploads/resumes` and filenames are saved on the applicant record. The `public/` folder does not contain resumes.
- Resume download is protected: only the job poster (recruiter) who created the job can download an applicant's resume via `GET /download-resume/:id`.
- When an application is rejected (e.g., duplicate applicant or recruiter trying to apply), any uploaded file is removed so rejected uploads are not kept.

---

## Email sending

The project uses `nodemailer` via `src/utils/mailer.js`. Transport selection logic:

- If `SMTP_HOST`/`SMTP_PORT` are provided, a custom SMTP transport is used.
- If only `SMTP_USER` and `SMTP_PASS` are present, the helper uses the Gmail service (recommended with an App Password for security).
- If no SMTP is configured, a test Ethereal account is created (useful for local dev without sending real mail).

The confirmation mail is sent after a successful application and includes job details, recruiter name, and a link to the job.

Important: If you supply real Gmail credentials, use an App Password (not your main account password) and never commit it.

---

## Screenshots

### About Page
![Aboutpage](/docs/screenshots/02_about1.png)
![Aboutpage](/docs/screenshots/02_about2.png)

### Registration Page
![Recruiter Registration](/docs/screenshots/03_register.png)

### Login Page
![Recruiter Login](/docs/screenshots/04_login.png)

### Profile Section

![Profile section](/docs/screenshots/05_profile.png)

### Job Posting form
![Job posting form](/docs/screenshots/06_job_posting.png)

### Job Listings
![Job Listings](/docs/screenshots/07_job_listings.png)

### Job details view for a normal user (Apply Now button visible)
![Job Details normal](/docs/screenshots/08_job_details.png)

### Job details view for the recruiter (Edit/Delete and View Applicants visible, delete modal open)
![Job details recruiter](/docs/screenshots/09_job_details_recruiter.png)

### Apply modal with form fields (name, email, mobile, resume upload)
![apply modal](/docs/screenshots/10_apply.png)

### Applicants view for recruiters
![Applicants](/docs/screenshots/11_applicants.png)

### Email confirmation sent
![Email confirmation](/docs/screenshots/12_email.png)

### Footer
![Footer](/docs/screenshots/13_footer.png)

---

## Troubleshooting & tips

- If mails are not sending, double-check `SMTP_USER`/`SMTP_PASS`. For Gmail, create an App Password and enable it in your Google account security settings.
- If uploads fail, ensure the `uploads/resumes` directory exists and the Node process has write permission. The app expects to save files under the project root in `uploads/resumes`.
- If sessions behave strangely, set a secure `SESSION_SECRET` and review cookie settings (especially if you run behind a proxy).
- Duplicate application prevention is in-memory and checks email and mobile (digits-only). If you restart the server, that history resets.

---

## Development & extending ideas

- Swap in a database: MongoDB / PostgreSQL and persist models.
- Use Passport.js or a token-based auth for robust authentication.
- Store uploads in cloud storage (S3 / Azure Blob) and store secure signed URLs for download.
- Add server-side pagination and caching if dataset grows.

---

## Contributing

Contributions are welcome. Please open issues for bugs or feature ideas. For code changes, fork the repo and open a pull request. Keep secrets out of commits and use `.env` files locally.

---

## License

This project is provided as-is for learning/demo purposes. Include your preferred license if you intend to open-source it publicly.

---

If you'd like, I can also generate `docs/screenshots/` and add placeholder images, or create a `.env.example` file — tell me if you want that and I'll add it.

# JobPortal (Easily) — Local Development

This is a small Node.js + Express + EJS job portal demo using an MVC layout, in-memory models, file upload for resumes, and an email confirmation flow (nodemailer).

Features implemented:

- MVC structure (controllers, models, views)
- EJS templating
- ES Modules (package.json has `type: module`)
- Express session-based login and last-visit tracking
- In-memory users, jobs, and applicants
- Recruiter registration and login
- Job posting (create, edit, delete) with validation
- Job listing, job details, and applicant apply (with PDF resume upload)
- Protected resume download for recruiters who posted the job
- Confirmation emails sent to applicants via Nodemailer (Ethereal fallback)

Important files:

- `index.js` — app entry and route wiring
- `src/controllers` — job and user controllers
- `src/models` — in-memory models
- `src/views` — EJS templates
- `src/middlewares` — auth, validation, lastVisit, email middleware
- `src/utils/mailer.js` — Nodemailer helper

Quick start (Windows PowerShell):

1. Install deps

```powershell
npm install
```

2. Environment variables (recommended)

Create a `.env` or set environment variables in your shell for production SMTP credentials. If not provided, the app uses Ethereal (test SMTP) and will log a preview URL for the sent message.

- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- SMTP_SECURE (true/false)
- EMAIL_FROM (optional)

3. Run

```powershell
npm start
```

4. Open `http://localhost:3000` and try flows:

- Register a recruiter and login.
- Post a job.
- As another user, view details and apply using a PDF resume.
- As the recruiter, view applicants and use the 'View Resume' link which is protected behind authentication and ownership.