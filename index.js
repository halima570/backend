const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("./connectdb");
const passport = require("passport");
require("./strategies/JwtStrategy");
require("./strategies/LocalStrategy");
require("./authenticate");
const app = express();

app.use(cors());

const follow = require("./models/follow");
const userRouter = require("./routes/userRoutes");
if (process.env.NODE_ENV !== "production") {
  // Load environment variables from .env file in non prod environments
  require("dotenv").config();
}
//Add the client URL to the CORS policy
const whitelist = process.env.WHITELISTED_DOMAINS
  ? process.env.WHITELISTED_DOMAINS.split(",")
  : [];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },

  credentials: true,
};
app.use(bodyParser.json());
//app.use(cors(corsOptions));


app.use(passport.initialize());

app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/users", userRouter);

app.post("/follow", async (req, res) => {
  const doc = await follow.create({
    username: req.body.username,
    follow: req.body.follow,
  });
  const doc1 = await follow.find({ username: req.body.username });
  res.send(doc1)}
  );
app.get("/follow", async (req, res) => {
  const doc = await follow.find({ username: req.query.username });
  res.send(doc);
});

// app.get("/unfollow", async (req, res) => {
//   console.log(req.query);
//   const doc = await follow.find({follow: req.query.follow,username: req.query.username  });
//   res.send(doc);
// });

app.delete("/follow", async (req, res) => {
  console.log("hi");

  const doc = await follow
    .deleteOne({ follow: req.query.follow, username: req.query.username })
    .then((data) => console.log(data))
    .catch((err) => console.log(err));
  const doc1 = await follow.find({ username: req.query.username });
  res.send(doc1);
});

app.get("/", function (req, res) {
  res.send({ status: "success" });
});

//Start the server in port 8081

const server = app.listen(process.env.PORT || 8081, function () {
  const port = server.address().port;

  console.log("App started at port:", port);
});
