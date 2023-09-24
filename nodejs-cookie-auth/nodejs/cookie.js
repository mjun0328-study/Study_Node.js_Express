var http = require("http");
var cookie = require("cookie");

http
  .createServer(function (request, response) {
    var cookies = {};
    if (request.headers.cookie !== undefined) {
      cookies = cookie.parse(request.headers.cookie);
    }
    console.log(cookies);
    // response.writeHead(200, {
    //   "Set-Cookie": ["hello=world", "welcome_to=nodejs"],
    // });
    response.end("Cookie!");
  })
  .listen(3000);
