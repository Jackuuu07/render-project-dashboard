const User = require('../models/user.models');
const bcrypt = require('bcryptjs');
const jwt  = require('jsonwebtoken')

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // ✅ Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // ✅ Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // token creation
    const token  = jwt.sign(
    {id: user._id, email: user.email },
    process.env.JWT_SECRET,
    {expiresIn: '365d'});

    res.json({
        message:"Login Successful",
        token,
        user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error('❌ Error in loginUser:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { loginUser };
