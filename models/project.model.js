const mongoose = require('mongoose');
const Counter = require('./counter.model');

const projectSchema = new mongoose.Schema({
  projectId: { type: Number, unique: true },
  userId: { type: Number, unique: true }, // will auto-increment
  projectName: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true }
}, { timestamps: true });

// Pre-save hook to auto-increment projectId and userId
projectSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Auto-increment projectId
    const projectCounter = await Counter.findByIdAndUpdate(
      { _id: 'projectId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.projectId = projectCounter.seq;

    // Auto-increment userId
    const userCounter = await Counter.findByIdAndUpdate(
      { _id: 'userId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.userId = userCounter.seq;
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
