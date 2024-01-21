const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const Admin = require('./models/adminModel');
const User = require('./models/userModel');
const userRoutes = require('./routes/userRoutes');
const multer = require('multer');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/assignmentwork', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Use bodyParser for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));

// Use express-session for session management
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Middleware to check if the user is logged in
const requireLogin = (req, res, next) => {
  if (!req.session.adminId) {
    return res.redirect('/admin/login');
  }
  next();
};

app.use('/user', userRoutes);

// Routes
app.get('/', (req, res) => {
  res.redirect('/admin/login');
});

app.get('/admin/login', (req, res) => {
  res.render('admin_login');
});

app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the provided credentials match the default admin credentials
    if (username === 'admin' && password === 'admin') {
      // If yes, set a session variable to indicate the admin is logged in
      req.session.adminId = 'admin'; // You can set any unique identifier here
      // Redirect to the admin_dashboard page
      return res.redirect('/admin/dashboard');
    } else {
      // If credentials don't match, redirect back to login
      return res.redirect('/admin/login');
    }
  } catch (error) {
    console.error(error);
    res.redirect('/admin/login');
  }
});

app.get('/admin/signup', (req, res) => {
  res.render('admin_signup');
});

app.post('/admin/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = new Admin({ username, password });
    await admin.save();
    res.redirect('/admin/login');
  } catch (error) {
    console.error(error);
    res.redirect('/admin/signup');
  }
});

app.get('/admin/dashboard', requireLogin, async (req, res) => {
  try {
    // Fetch the list of users from the database
    const users = await User.find();
    res.render('admin_dashboard', { users });
  } catch (error) {
    console.error(error);
    res.send('Error fetching user data');
  }
});

app.get('/admin/create-user', requireLogin, (req, res) => {
  res.render('admin_create_user');
});
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));


app.post('/admin/create-user', requireLogin, async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = new User({ username, password });
    await user.save();
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    res.send('Error creating user');
  }
});

app.get('/admin/view-users', requireLogin, async (req, res) => {
  try {
    const users = await User.find();
    res.render('admin_view_users', { users });
  } catch (error) {
    console.error(error);
    res.send('Error fetching user data');
  }
});

app.get('/admin/admin_login', requireLogin, (req, res) => {
  // Render the admin_login.ejs view
  res.render('admin_login');
});

// ... (Remaining code)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1]);
  },
});


const upload = multer({ storage: storage });


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
