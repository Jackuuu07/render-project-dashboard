const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  commentId: { type: Number, unique: true },
  projectId: { type: Number, required: true },
  cardId: { type: Number, required: true },
  userId: { type: Number, required: true },
  commentText: { type: String, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  likedBy: [{ type: Number }],
  dislikedBy: [{ type: Number }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Comment", commentSchema);
