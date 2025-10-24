import ejsLayouts from 'express-ejs-layouts';
import express from 'express';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import fs from 'fs';
// controllers
import UserController from './src/controllers/user.controller.js';
import JobController from './src/controllers/job.controller.js';
// middlewares
import validateRegistration, { registrationRules } from './src/middlewares/registration.middleware.js';
import validateJobPost, { jobPostRules } from './src/middlewares/jobpost.middleware.js';
import lastVisit from './src/middlewares/lastVisit.js';
import emailMiddleware from './src/middlewares/email.middleware.js';
import { auth } from './src/middlewares/auth.js';

const app = express();

// Configure EJS
app.use(ejsLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve('src', 'views')));

// Use session and cookies
app.use(cookieParser());
app.use(session({
  secret: 'SecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Use the public as static folder
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store resumes outside of the public folder for protected delivery
const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (err) {
  console.error('Failed to create uploads directory', err);
}

// Multer storage for resume uploads (saved to uploads/resumes)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Keep unique, descriptive filenames: resume-job<jobId>-<timestamp>.pdf
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ext || '.pdf';
    const jobId = req.params && req.params.id ? req.params.id : 'unknown';
    const filename = `resume-job${jobId}-${Date.now()}${safeExt}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only PDF files
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Middleware to make userEmail session available in all views
// Last visit middleware (keeps index.js tidy)
app.use(lastVisit);

const usersController = new UserController();
const jobsController = new JobController();

app.get('/', (req, res) => { res.render('index'); });
app.get('/about', (req, res) => { res.render('about') });

// User related routes
app.get('/register', usersController.getRegister);
app.post('/register', registrationRules, validateRegistration, usersController.postRegister);
app.get('/login', usersController.getLogin);
app.post('/login', usersController.postLogin);
app.get('/logout', auth, usersController.logout);

// Jobs related routes
app.get('/jobs', jobsController.getAllJobs);
app.get('/postjob', auth, jobsController.getPostJob);
app.post('/postjob', auth, jobPostRules, validateJobPost, jobsController.postJob.bind(jobsController));
app.get('/jobdetails/:id', jobsController.getJobDetails);
// Delete job (only poster)
app.post('/deletejob/:id', auth, jobsController.deleteJob.bind(jobsController));

// Edit existing job (only poster)
app.get('/postjob/:id', auth, jobsController.getPostJob.bind(jobsController));
app.post('/postjob/:id', auth, jobPostRules, validateJobPost, jobsController.updateJob.bind(jobsController));

// Applicants related routes
// Recruiter views applicants for a specific job
app.get('/applicants/:id', auth, jobsController.getApplicants.bind(jobsController));
app.get('/myjobs', auth, jobsController.getMyJobs.bind(jobsController));

// Apply to a job (applicant submits application) - handles resume upload
// Flow: multer -> save applicant -> send confirmation email -> final render
app.post('/apply/:id', upload.single('resume'), jobsController.applyToJob.bind(jobsController), emailMiddleware.sendApplicationConfirmation, jobsController.applyResponse.bind(jobsController));

// Protected resume download (recruiter-only)
app.get('/download-resume/:id', auth, jobsController.downloadResume.bind(jobsController));

app.listen(3000, () => {
  console.log('Server is running on PORT 3000');
});