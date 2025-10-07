const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/user.routes');
const errorHandler = require('./middlewares/errorhandler');
const LoginUser = require('./controllers/user.login');
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
connectDB();

// Routes
app.use('/api/users', userRoutes);

// Error Handling Middleware
app.use(errorHandler);


// Default Route
app.get('/', (req, res) => {
  res.send('API is running...');
});


// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
