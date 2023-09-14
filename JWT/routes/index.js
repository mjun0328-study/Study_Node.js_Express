var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const key = "i'm teapot";

router.use(bodyParser.urlencoded({ extended: false }));
router.use(cookieParser());

/* GET home page. */
router.get("/", function (req, res, next) {
  let token = req.cookies?.JWT;
  console.log(token);
  if (token !== undefined) token = jwt.verify(token, key);
  res.render("index", { name: token?.name ?? "", sid: token?.sid ?? "" });
});

router.post("/sign", function (req, res, next) {
  const token = jwt.sign({ name: req.body.name, sid: req.body.sid }, key, {
    algorithm: "HS256",
    expiresIn: "1h",
  });

  res.cookie("JWT", token);
  res.redirect("/");
});

module.exports = router;
