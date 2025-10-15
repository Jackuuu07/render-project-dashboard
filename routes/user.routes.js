const express = require('express');
const { registerUser } = require('../controllers/SignUp.controllers'); // ✅ Import the function
const router = express.Router();
const { loginUser } = require('../controllers/login.controllers');

// ✅ Route definition with controller
router.post('/register',  registerUser);

// Login Route
router.post('/login', loginUser);

module.exports = router;
