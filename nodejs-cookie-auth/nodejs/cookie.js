var http = require("http");
http
  .createServer(function (request, response) {
    // response.writeHead(200, {
    //   "Set-Cookie": ["hello=world", "welcome_to=nodejs"],
    // });
    response.end("Cookie!");
  })
  .listen(3000);
