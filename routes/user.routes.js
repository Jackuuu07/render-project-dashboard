const express = require('express');
const { registerUser } = require('../controllers/user.controllers'); // ✅ Import the function
const router = express.Router();

// ✅ Route definition with controller
router.post('/register', registerUser);

module.exports = router;
