const mongoose = require('mongoose');
const Counter = require('./counter.model')


const userSchema = new mongoose.Schema({
  userId:{
    type: Number,
    unique: true
  },
  
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}, {timestamps: true});
// Auto-increment userId before saving
userSchema.pre('save', async function(next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'userId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.userId = counter.seq;
  }
  next();
});
const User = mongoose.model('User', userSchema);

module.exports = User;
