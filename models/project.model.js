const mongoose = require('mongoose');
const Counter = require('./counter.model');

// Import card schema

const projectSchema = new mongoose.Schema({
  projectId: { type: Number, unique: true },
  projectName: { type: String, required: true },
  description: { type: String },
  ownerId: { type: Number, required: true },
  assignedUsers: { type: [Number], default: [] },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-increment projectId
projectSchema.pre('save', async function(next) {
  if (this.isNew) {
    const projectCounter = await Counter.findByIdAndUpdate(
      { _id: 'projectId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.projectId = projectCounter.seq;
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;



