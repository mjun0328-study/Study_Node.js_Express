const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const template = require("../lib/template.js");
const sanitizeHtml = require("sanitize-html");

router.get("/create", (req, res) => {
  var title = "WEB - create";
  var list = template.list(req.list);
  var html = template.HTML(
    title,
    list,
    `
      <form action="/topic/create_process" method="post">
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

router.post("/create_process", (req, res) => {
  var post = req.body;
  var filteredTitle = path.parse(post.title).base;
  var description = post.description;
  fs.writeFile(`data/${filteredTitle}`, description, "utf8", function (err) {
    res.writeHead(302, { Location: `/topic/${filteredTitle}` });
    res.end("Success");
  });
});

router.get("/update/:pageId", (req, res) => {
  var filteredPath = path.parse(req.params.pageId).base;
  var list = template.list(req.list);
  fs.readFile(`data/${filteredPath}`, "utf8", function (err, description) {
    var title = req.params.pageId;
    var html = template.HTML(
      title,
      list,
      `
        <form action="/topic/update_process" method="post">
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
      `<a href="/topic/create">create</a> <a href="/topic/update?id=${title}">update</a>`
    );
    res.writeHead(200);
    res.end(html);
  });
});

router.post("/update_process", (req, res) => {
  var post = req.body;
  var filteredId = path.parse(post.id).base;
  var filteredTitle = path.parse(post.title).base;
  var description = post.description;
  fs.rename(`data/${filteredId}`, `data/${filteredTitle}`, function () {
    fs.writeFile(`data/${filteredTitle}`, description, "utf8", function (err) {
      res.redirect(`/topic/${filteredTitle}`);
    });
  });
});

router.get("/:pageId", (req, res, next) => {
  var filteredPath = path.parse(req.params.pageId).base;
  fs.readFile(`data/${filteredPath}`, "utf8", function (err, description) {
    if (err) {
      next(err);
    } else {
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
          <a href="/topic/create">create</a>
          <a href="/topic/update/${sanitizedTitle}">update</a>
          <form action="/topic/delete_process" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
          </form>
        `
      );
      res.send(html);
    }
  });
});

router.post("/delete_process", (req, res) => {
  var post = req.body;
  var filteredId = path.parse(post.id).base;
  fs.unlink(`data/${filteredId}`, function () {
    res.redirect("/");
  });
});

module.exports = router;
