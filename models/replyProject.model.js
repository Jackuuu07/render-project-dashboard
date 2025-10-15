const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  commentId: {
    type: Number,
    ref: "Comment",
    required: true,
  },
  userId: {
    type: Number,
    required: true,
  },
  replyText: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Reply", replySchema);
