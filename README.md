# Easily — Job Portal (Node.js + Express + EJS)

A lightweight job portal built with Node.js, Express and EJS. Designed as a learning project and a simple recruiter/applicant workflow with protected resume uploads, recruiter-only controls, paginated listings, and real email confirmations (Gmail supported).

---

## Table of contents

- Project overview
- Features
- System requirements
- Quick start (local)
- Environment variables
- File structure
- Data models (in-memory)
- Routes / API overview
- Uploads & security
- Email sending (nodemailer + Gmail)
- How to take and attach screenshots
- Troubleshooting & tips
- Contributing
- License

---

## Project overview

Easily is a small job board / portal suitable for demonstrations, interviews and learning. It uses server-side rendered EJS views and a minimal in-memory data store (no database) so you can run it quickly locally. Features include recruiting flows (post/edit/delete jobs), applicants with resume uploads (stored in a protected folder), recruiter-only applicant views and protected resume download, and confirmation emails sent to applicants.

This repo is intentionally compact and easy to extend into a production-ready app (by adding a database, user authentication provider, persistent storage, etc.).

---

## Features

- Server: Node.js + Express (ES modules)
- Views: EJS templating
- Sessions: express-session for login & recruiter flows
- Uploads: multer saves resumes to `uploads/resumes` (protected, not served by static)
- Job CRUD: post, edit, delete (recruiter-only)
- Applicants: apply with resume, duplicate prevention (by email or mobile), protected download
- Email: confirmation mails using nodemailer (supports Gmail app password)
- Validation: express-validator rules on job posting and application
- Pagination & search for job listings
- Minimal in-memory models (users, jobs, applicants) to keep project simple and portable

---

## System requirements (basic)

- Node.js 16+ (LTS recommended)
- npm (comes with Node)
- Modern browser for UI (Chrome/Edge/Firefox)
- Optional: Gmail account with an App Password if you want real email delivery (recommended)

---

## Quick start (local)

1. Clone the repository and install dependencies

```powershell
git clone <repo-url> jobportal
cd jobportal
npm install
```

2. Create environment variables (see next section). You can use PowerShell to set them for the session:

```powershell
$env:SMTP_USER='your@gmail.com'; $env:SMTP_PASS='your_gmail_app_password'; $env:SESSION_SECRET='some_long_secret'; $env:APP_BASE_URL='http://localhost:3000'
```

Alternatively create a `.env` file (not committed) using the `.env.example` as a template and use your preferred method to load it.

3. Start the app

```powershell
npm start
# or
node index.js
```

4. Open http://localhost:3000 in your browser.

---

## Environment variables

The app reads configuration from environment variables. Required/important variables:

- `PORT` — port to run on (default: 3000)
- `SESSION_SECRET` — session signing secret (required for production)
- `SMTP_USER` — SMTP username (for Gmail put your email here)
- `SMTP_PASS` — SMTP password or Gmail App Password
- `SMTP_HOST` — optional: custom SMTP host (if not provided, Gmail is used when SMTP_USER/PASS set)
- `SMTP_PORT` — optional
- `EMAIL_FROM` — optional friendly From header (e.g. "Easily <no-reply@easily.local>")
- `APP_BASE_URL` — optional base url used in email links (default `http://localhost:3000`)

Create a `.env` from the example or export them in your shell before starting.

---

## Example `.env.example`

```text
# Server
PORT=3000
SESSION_SECRET=change-me-to-a-secure-string

# Mail (Gmail recommended if you only set SMTP_USER & SMTP_PASS)
SMTP_USER=youremail@gmail.com
SMTP_PASS=your_gmail_app_password
# Optional (only if using a different SMTP provider)
SMTP_HOST=
SMTP_PORT=
EMAIL_FROM=Easily <no-reply@easily.local>

# Base URL used in emails
APP_BASE_URL=http://localhost:3000
```

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

1. `screenshots/01_home.png` — Homepage / job listings (show search bar and a few job cards)
2. `screenshots/02_job_details.png` — Job details view for a normal user (Apply Now button visible)
3. `screenshots/03_job_details_recruiter.png` — Job details view for the recruiter (Edit/Delete and View Applicants visible, delete modal open)
4. `screenshots/04_apply_modal.png` — Apply modal with form fields (name, email, mobile, resume upload)
5. `screenshots/05_applicants_list.png` — Recruiter applicants page showing applicant rows and download resume button
6. `screenshots/06_email_sample.png` — Example of the confirmation email received by applicant (HTML view)

Instruction: After you take each screenshot, add it to `docs/screenshots/` and then in this README replace the placeholder text with a markdown image link, e.g.:

```md
![Homepage](/docs/screenshots/01_home.png)
```

Below are embedded placeholder images (SVG) already added to `docs/screenshots/` so the README shows previews immediately. Replace them with your screenshots (PNG) using the same filenames when ready.

![Homepage](/docs/screenshots/01_home.png)

![Job details (user)](/docs/screenshots/02_job_details.png)

![Job details (recruiter)](/docs/screenshots/03_job_details_recruiter.png)

![Apply modal](/docs/screenshots/04_apply_modal.png)

![Applicants list](/docs/screenshots/05_applicants_list.png)

![Email sample](/docs/screenshots/06_email_sample.png)

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

Notes & Next steps:

- Data is in-memory and resets on server restart. For persistence, plug in a database (MongoDB / SQLite / MySQL).
- For production, configure a real SMTP provider and secure sessions/cookies (Secure flag, store sessions server-side).
- Consider moving file storage to cloud (S3) and using signed URLs for downloads.

If you'd like, I can:

- Wire a database (SQLite/Mongo) and migrate in-memory models.
- Add end-to-end tests.
- Harden security headers and CSRF protection.
