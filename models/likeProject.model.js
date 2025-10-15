const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  projectId: {
    type: Number,
    ref: "Project",
    required: true,
  },
  userId: {
    type: Number,
    required: true,
    unique: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Like", likeSchema);
