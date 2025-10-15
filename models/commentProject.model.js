const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  projectId: {
    type: Number,
    ref: "Project",
    required: true,
  },
  userId: {
    type: Number, // assuming your user IDs are numeric
    required: true,
  },
  commentText: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Comment", commentSchema);
