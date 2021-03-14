const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  text: {
    type: String,
    required: "Name is required",
  },
  title: {
    type: String,
    required: "Title is required"
  },
  photo: {
    data: Buffer,
    contentType: String,
  },
  likes: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  score:Number,
  username:String,
  comments: [
    {
      text: String,
      created: { type: Date, default: Date.now },
      postedBy: { type: mongoose.Schema.ObjectId, ref: "User" },
      likes: Number,
      incomments:[{text:String,postedBy:{ type: mongoose.Schema.ObjectId, ref: "User" }}]
    },
  ],
  postedBy: { type: mongoose.Schema.ObjectId, ref: "User" },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", PostSchema);
