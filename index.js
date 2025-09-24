import ejsLayouts from 'express-ejs-layouts';
import express from 'express';
import path from 'path';
import userController from './src/controllers/user.controller.js';
import validateRegistration from './src/middlewares/registration.middleware.js';

const app = express();

// Configure EJS
app.use(ejsLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve('src', 'views')));

// Use the public as static folder
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const usersController = new userController();

app.get('/', (req, res) => { res.render('index'); });

app.get('/register', usersController.getRegister);
app.post('/register',validateRegistration ,usersController.postRegister);
app.get('/login', usersController.getLogin);
app.post('/login', usersController.postLogin)

app.get('/jobs', (req,res) => {
  res.render('jobListings');
}); 

app.get('/about', (req,res) => {
  res.render('about');
});


app.get('/jobdetails', (req,res) => {
  res.render('jobdetails');
});

app.get('/applicants', (req,res) => {
  res.render('applicants');
});

app.get('/postjob', (req,res) => {
  res.render('postjob');
});

app.listen(3000, () => {
    console.log('Server is running on PORT 3000');
});