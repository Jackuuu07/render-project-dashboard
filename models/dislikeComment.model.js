  const mongoose = require("mongoose");

  const dislikeSchema = new mongoose.Schema({
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

  module.exports = mongoose.model("Dislike", dislikeSchema);
