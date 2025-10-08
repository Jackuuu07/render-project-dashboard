const mongoose = require('mongoose');
const Counter = require('./counter.model');

const projectSchema = new mongoose.Schema({
  projectId: {
    type: Number,
    unique: true
  },
  userId: {
    type: Number,
    unique:true, // <-- userId as numeric
    required: true
  },
  projectName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// Auto-increment projectId before saving
projectSchema.pre('save', async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'projectId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.projectId = counter.seq;
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
