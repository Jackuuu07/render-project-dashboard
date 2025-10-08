const express = require('express');
const { registerUser } = require('../controllers/SignUp.controllers'); // ✅ Import the function
const router = express.Router();
const { loginUser } = require('../controllers/login.controllers');
const protect = require('../middlewares/protectRoute')

// ✅ Route definition with controller
router.post('/register',protect,  registerUser);

// Login Route
router.post('/login', protect, loginUser);

module.exports = router;
