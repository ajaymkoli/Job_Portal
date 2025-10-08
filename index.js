import ejsLayouts from 'express-ejs-layouts';
import express from 'express';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';
// controllers
import UserController from './src/controllers/user.controller.js';
import JobController from './src/controllers/job.controller.js';
// middlewares
import validateRegistration from './src/middlewares/registration.middleware.js';
import { auth } from './src/middlewares/auth.js';

const app = express();

// Configure EJS
app.use(ejsLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve('src', 'views')));

// Use session and cookies
app.use(cookieParser());
app.use(session({
  secret: 'SecreteKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Use the public as static folder
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to make userEmail session available in all views
app.use((req, res, next) => {
  res.locals.userEmail = req.session.userEmail;
  next()
});

const usersController = new UserController();
const jobsController = new JobController();

app.get('/', (req, res) => { res.render('index'); });
app.get('/about', (req, res) => { res.render('about') });

// User related routes
app.get('/register', usersController.getRegister);
app.post('/register', validateRegistration, usersController.postRegister);
app.get('/login', usersController.getLogin);
app.post('/login', usersController.postLogin);
app.get('/logout', usersController.logout);

// Jobs related routes
app.get('/jobs', jobsController.getAllJobs);
app.get('/postjob', auth, jobsController.getPostJob);
app.post('/postjob', auth, jobsController.postJob);
app.get('/jobdetails', jobsController.getJobDetails);

// Applicants related routes
app.get('/applicants', (req, res) => { res.render('applicants') });

app.listen(3000, () => {
  console.log('Server is running on PORT 3000');
});