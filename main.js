const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const template = require("./lib/template.js");
const bodyParser = require("body-parser");
const compression = require("compression");
const topicRoutes = require("./routes/topic");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.get("*", (req, res, next) => {
  fs.readdir("./data/", function (error, filelist) {
    req.list = filelist;
    next();
  });
});

app.use("/topic", topicRoutes);

app.get("/", (req, res) => {
  var title = "Welcome";
  var description = "Hello, Node.js";
  var list = template.list(req.list);
  var html = template.HTML(
    title,
    list,
    `
      <h2>${title}</h2>
      <p>${description}</p>
      <img src="/images/park.jpg" style="width: 300px; display: block;">
    `,
    `<a href="/topic/create">create</a>`
  );
  res.send(html);
});

app.use((req, res, next) => {
  res.status(404).send("Sorry cant find that!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
