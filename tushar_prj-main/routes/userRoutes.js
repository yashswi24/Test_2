// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { requireUserLogin } = require('../middlewares/auth'); // Define requireUserLogin middleware
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/dashboard', requireUserLogin, async (req, res) => {
  try {
    // Retrieve the user data from the database based on the logged-in user's ID
    const user = await User.findById(req.session.userId);

    if (!user) {
      // Handle the case where the user is not found
      return res.send('User not found');
    }

    // Pass the user data to the user_dashboard view
    res.render('user_dashboard', { user });
  } catch (error) {
    console.error(error);
    res.send('Error fetching user data');
  }
});





// Profile Update Page
router.get('/profile', requireUserLogin, (req, res) => {
    // Render the profile_update.ejs view
    res.render('profile_update');
});

// User login route
router.get('/login', (req, res) => {
    res.render('user_login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });

    if (user) {
      req.session.userId = user._id; // Set user session ID
      req.session.user = user; // Set user object in session
      return res.redirect('/user/dashboard');
    } else {
      return res.redirect('/user/login');
    }
  } catch (error) {
    console.error(error);
    res.redirect('/user/login');
  }
});



router.get('/dashboard', requireUserLogin, async (req, res) => {
  // Fetch user data from the database including approval status
  // Render the user_dashboard.ejs view with conditional data display.
});


router.post('/profile-update', async (req, res) => {
  const userId = req.session.userId;
  const { fullName, image } = req.body;

  try {
    // Process and save the image file
    const imageUrl = '/uploads/' + processAndSaveImage(image);

    // Update the user's profile information
    await User.findByIdAndUpdate(userId, { 'profile.fullName': fullName, 'profile.imageUrl': imageUrl });

    res.redirect('/user/user_dashboard');
  } catch (error) {
    console.error(error);
    res.redirect('/user/profile-update');
  }
});

router.post('/profile-update', requireUserLogin, async (req, res) => {
  // Handle user profile updates (including image upload)
  // Update user details in the database and store the edited images on the server.
});
router.post('/update-welcome', requireUserLogin, upload.single('imageUpload'), async (req, res) => {
  const userId = req.session.userId;
  const { fullName } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Update the user's profile information in the database
    await User.findByIdAndUpdate(userId, { 'profile.fullName': fullName, 'profile.imageUrl': imageUrl });

    // Redirect to the user dashboard after updating
    res.redirect('/user/view');
  } catch (error) {
    console.error(error);
    res.send('Error updating welcome page');
  }
});

router.get('/view', requireUserLogin, async (req, res) => {
  try {
      // Fetch user details from the database using the logged-in user's ID
      const userId = req.session.userId; // Assuming user ID is stored in the session
      const user = await User.findById(userId);

      // Check if the user exists
      if (!user) {
          return res.status(404).send('User not found');
      }

      // Render the view.ejs view with user details
      res.render('view', { user });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});
router.post('/delete', requireUserLogin, async (req, res) => {
  const userIdToDelete = req.body.userId;

  try {
      // Delete the user from the database using the provided user ID
      await User.findByIdAndDelete(userIdToDelete);

      // Redirect back to the view page after deletion
      res.redirect('/user/view');
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

// Additional routes for update approval request, conditional data viewing, and approval status indication go here


module.exports = router;
