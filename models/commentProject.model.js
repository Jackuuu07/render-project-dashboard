// models/commentProject.model.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  commentId: { type: Number, unique: true }, // <-- Auto-increment ID
  projectId: { type: Number, required: true },
  cardId: { type: Number, required: true },
  userId: { type: Number, required: true },
  commentText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Middleware to auto-increment commentId
commentSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  const lastComment = await mongoose.model("Comment").findOne().sort({ commentId: -1 });
  this.commentId = lastComment ? lastComment.commentId + 1 : 1; // start from 1
  next();
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
