const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const template = require("./lib/template.js");
const path = require("path");
const sanitizeHtml = require("sanitize-html");
const qs = require("querystring");
const bodyParser = require("body-parser");
const compression = require("compression");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.get("*", (req, res, next) => {
  fs.readdir("./data/", function (error, filelist) {
    req.list = filelist;
    next();
  });
});

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
      `,
    `<a href="/create">create</a>`
  );
  res.send(html);
});

app.get("/page/:pageId", (req, res) => {
  var filteredPath = path.parse(req.params.pageId).base;
  fs.readFile(`data/${filteredPath}`, "utf8", function (err, description) {
    var title = req.params.pageId;
    var sanitizedTitle = sanitizeHtml(title);
    var sanitizedDescription = sanitizeHtml(description, {
      allowedTags: ["h1"],
    });
    var list = template.list(req.list);
    var html = template.HTML(
      title,
      list,
      `
          <h2>${sanitizedTitle}</h2>
          <p>${sanitizedDescription}</p>
        `,
      `
          <a href="/create">create</a>
          <a href="/update/${sanitizedTitle}">update</a>
          <form action="/delete_process" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
          </form>
        `
    );
    res.send(html);
  });
});

app.get("/create", (req, res) => {
  var title = "WEB - create";
  var list = template.list(req.list);
  var html = template.HTML(
    title,
    list,
    `
        <form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
      `,
    ""
  );
  res.send(html);
});

app.post("/create_process", (req, res) => {
  // var body = "";
  // req.on("data", function (data) {
  //   body = body + data;
  // });
  // req.on("end", function () {
  //   var post = qs.parse(body);
  //   var filteredTitle = path.parse(post.title).base;
  //   var description = post.description;
  //   fs.writeFile(`data/${filteredTitle}`, description, "utf8", function (err) {
  //     res.writeHead(302, { Location: `/page/${filteredTitle}` });
  //     res.end("Success");
  //   });
  // });

  var post = req.body;
  var filteredTitle = path.parse(post.title).base;
  var description = post.description;
  fs.writeFile(`data/${filteredTitle}`, description, "utf8", function (err) {
    res.writeHead(302, { Location: `/page/${filteredTitle}` });
    res.end("Success");
  });
});

app.get("/update/:pageId", (req, res) => {
  var filteredPath = path.parse(req.params.pageId).base;
  var list = template.list(req.list);
  fs.readFile(`data/${filteredPath}`, "utf8", function (err, description) {
    var title = req.params.pageId;
    var html = template.HTML(
      title,
      list,
      `
          <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `,
      `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
    );
    res.writeHead(200);
    res.end(html);
  });
});

app.post("/update_process", (req, res) => {
  var post = req.body;
  var filteredId = path.parse(post.id).base;
  var filteredTitle = path.parse(post.title).base;
  var description = post.description;
  fs.rename(`data/${filteredId}`, `data/${filteredTitle}`, function () {
    fs.writeFile(`data/${filteredTitle}`, description, "utf8", function (err) {
      res.redirect(`/page/${filteredTitle}`);
    });
  });
});

app.post("/delete_process", (req, res) => {
  var post = req.body;
  var filteredId = path.parse(post.id).base;
  fs.unlink(`data/${filteredId}`, function () {
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// var http = require("http");
// var fs = require("fs");
// var url = require("url");
// var qs = require("querystring");
// var path = require("path");
// var sanitizeHtml = require("sanitize-html");

// var template = require("./lib/template.js");

// var app = http.createServer(function (request, response) {
//   var _url = request.url;
//   var queryData = url.parse(_url, true).query;
//   var pathname = url.parse(_url, true).pathname;

//   if (pathname === "/") {
//     if (queryData.id === undefined) {
//     } else {
//     }
//   } else if (pathname === "/create") {
//   } else if (pathname === "/create_process") {
//   } else if (pathname === "/update") {
//   } else if (pathname === "/update_process") {
//   } else if (pathname === "/delete_process") {
//   } else {
//     response.writeHead(404);
//     response.end("Not Found");
//   }
// });
// app.listen(3000);
