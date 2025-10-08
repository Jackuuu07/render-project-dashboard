const User = require('../models/user.models');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
  try {

    console.log("Incoming body is : ", req.body);
  
    const { name, email, password } = req.body;

    // ✅ Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    // ✅ Save to database
    await newUser.save();

    // ✅ Send success response
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('❌ Error in registerUser:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { registerUser };




// const User = require('../models/user.models');

// const bcrypt = require('bcryptjs');

// const registerUser = async (req, res) => {
//     try {
//           const { name, email, password } = req.body;

//           if(!name || !email || !password) {
//             return res.status(400).json({ message: 'Please provide name, email and password' });
//           }

//           const existingUser = await User.findOne({ email });

//           if(existingUser) {
//             return res.status(400).json({ message: 'User already exists' });
//           }

//           const hashpassword = await bcrypt.hash(password, 10);

//           const newUser = new User({
//             name,
//             email,
//             password: hashpassword
//           });

//     } catch (error) {
//         console.error('❌ Error in registerUser:', error.message);
//         res.status(500).json({ message: 'Server Error' });  
//     }
// }

// module.exports = { registerUser };
