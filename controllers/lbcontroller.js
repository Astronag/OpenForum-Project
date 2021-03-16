const Post = require("../models/post");
const user = require("../models/user");
const User = require("../models/user");

const leaderboard = (req, res) => {
  Post.find({}, function (err, docs) {
    docs.forEach(function (data) {
      var userid = data.postedBy;
      var likes = data.likes.length;

      var comments = data.comments.length;
      console.log(comments);
      const date2 = new Date();
      const diffTime = Math.abs(date2 - data.created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      console.log(diffDays);
      const followers=User.find({}).project({ _id : 0, followers : 1 }).toArray()
      console.log(followers)
      
      User.findByIdAndUpdate(
        userid,
        {$inc:{ score: (likes*comments) / diffDays }},
        function (errr, doc) {
          if (errr) {
            console.log(err);
          } else {
            console.log("Updated User : ", doc);
          }
        }
      );
    });
  }).exec((err, posts) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
  });
  var mysort = { score: -1 };
  User.find()
    .sort(mysort)
    .exec((errrr, result) => {
      if (errrr) console.log("error");
      else res.json(result);
    });
};

module.exports = { leaderboard };
