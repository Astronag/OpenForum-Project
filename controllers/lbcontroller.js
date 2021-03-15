const Post = require("../models/post");
const user = require("../models/user");
const User = require("../models/user");

const leaderboard = async (req, res) => {
  await User.updateMany({
    $set: { score: 0 },
  }).exec(async (err, posts) => {
    await Post.find({}, async function (err, docs) {
      console.log(docs.length);
      docs.forEach(async function (data) {
        var userid = data.postedBy;
        var updatedscore = data.score;
        console.log(updatedscore);
      
    
    await User.findByIdAndUpdate(
      userid,
      { $set: { score: updatedscore } },
      async function (errr, doc) {
        if (errr) {
          console.log(err);
        } else {
          console.log("Updated User : ", doc);
        }
      }
    ).exec(async (er, result2) => {
      await User.find({}, async function (error, doc) {
        doc.forEach(async function (data) {
          var userid = data.id;
          var totalscore = data.score;
          var tier = "Level 1 Contributor";
          if (totalscore >= 500) tier = "Level 3 Contributor";
          else if (totalscore >= 200 && totalscore < 500)
            tier = "Level 2 Contributor";

          User.findByIdAndUpdate(userid, {
            $set: {
              badge: tier,
            },
          }).exec();
        });
      }).exec(async (e, result3) => {
        var mysort = { score: -1 };
        await User.find()
          .sort(mysort)
          .exec((err, result) => {
            if (err) throw err;
            else res.json(result);
          });
      });
    });
  }) 
})})}

module.exports = { leaderboard }
