const express = require('express');
const { registerUser } = require('../controllers/user.controllers'); // ✅ Import the function
const router = express.Router();
const { loginUser } = require('../controllers/user.login');

// ✅ Route definition with controller
router.post('/register', registerUser);

// Login Route
router.post('/login', loginUser);

module.exports = router;
