const Post = require("../models/post");
const User = require("../models/user");
const fs = require("fs");
const formidable = require("formidable");
const session = require("express-session");
const passport = require("passport");

const create = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }
    let post = new Post(fields);
    post.postedBy = req.profile;
    if (files.photo) {
      post.photo.data = fs.readFileSync(files.photo.path);
      post.photo.contentType = files.photo.type;
    }
    post.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      updateScore(req.profile._id, 2);
      res.json(result);
    });
  });
};

const postByID = (req, res, next, id) => {
  Post.findById(id)
    .populate("postedBy", "_id name")
    .exec((err, post) => {
      if (err || !post)
        return res.status("400").json({
          error: "Post not found",
        });
      req.post = post;
      next();
    });
};

const listByUser = (req, res) => {
  Post.find({ postedBy: req.profile._id })
    .populate("comments", "text created")
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .sort("-created")
    .exec((err, posts) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json(posts);
    });
};

const listNewsFeed = (req, res) => {
  let following = req.profile.following;
  following.push(req.profile._id);
  Post.find({ postedBy: { $in: req.profile.following } })
    .populate("comments", "text created")
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .sort("-created")
    .exec((err, posts) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json(posts);
    });
};

const remove = (req, res) => {
  let post = req.post;
  post.remove((err, deletedPost) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json(deletedPost);
  });
};

const photo = (req, res, next) => {
  res.set("Content-Type", req.post.photo.contentType);
  return res.send(req.post.photo.data);
};

const like = (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { likes: req.body.userId } },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json(result);
  });
};

const unlike = (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { likes: req.body.userId } },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json(result);
  });
};

const likeacomment = (req, res) => {
  Post.findOneAndUpdate(
    {
      _id: req.body.postId,
      "comments.text": req.body.comment,
      "comments.postedBy": req.body.postedBy,
    },
    { $inc: { "comments.$.likes": 1 } }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json(result);
  });
};

const commentincomment = (req, res) => {
  var changes = {
    text: req.body.comtext,
    postedBy: req.body.userId,
  };
  Post.findOneAndUpdate(
    { _id: req.body.postId, "comments.text": req.body.comment },
    { $push: { "comments.$.incomments": changes } },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    updateScore(req.body.userId, 1);
    res.json(result);
  });
};

const comment = (req, res) => {
  var commentf = {
    text: req.body.comment,
    postedBy: req.body.userId,
    likes: 0,
  };

  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { comments: commentf } },
    { new: true }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      updateScore(req.body.userId, 1);
      res.json(result);
    });
};
const uncomment = (req, res) => {
  let comment = req.body.comment;
  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { comments: { _id: comment._id } } },
    { new: true }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json(result);
    });
};

const isPoster = (req, res, next) => {
  let isPoster = req.post && req.auth && req.post.postedBy._id == req.auth._id;
  if (!isPoster) {
    return res.status("403").json({
      error: "User is not authorized",
    });
  }
  next();
};

const updateScore = (userId, points) => {
  User.findOneAndUpdate({ _id: userId }, { $inc: { score: points } }).exec(
    (err, result) => {
      if (err) {
        return err;
      }
    }
  );
};

const trendingposts = (req, res) => {
  Post.find({}, function (err, docs) {
    docs.forEach(function (data) {
      var id=data.id
      var likes = data.likes.length;
    
    
      var comments = data.comments.length;
      console.log(comments);
      const date2 = new Date();
      const diffTime = Math.abs(date2 - data.created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      console.log(diffDays);
      const updated = Post.findByIdAndUpdate(
        id,
        {score: (likes+comments)/diffDays },
        function (errr, doc) {
          if (errr) {
            console.log(err);
          } else {
            console.log("Updated User : ", doc);
          }
        }
      );
      console.log(updated)
      var mysort = { score: -1 };
      Post.find().sort(mysort).exec((err,result)=>{
        if (err) throw err;
        else
           res.json(result)
      })
    
    });
  }).exec((err, posts) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
  
  });
};

module.exports = {
  listByUser,
  listNewsFeed,
  create,
  postByID,
  remove,
  photo,
  like,
  unlike,
  comment,
  uncomment,
  isPoster,
  likeacomment,
  commentincomment,
  trendingposts
};
