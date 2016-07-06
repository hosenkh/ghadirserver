server = function () {
  var
  __ = require("underscore"),
  http = require("http"),
  url = require("url"),
  cookieParser = require('./cookieParser'),

  // head = {"content-type": "text/plain"},

  singleInject = function (fun, inj) {
    var arg = inj;
    fun();
  },

  
  init = function (route, handle) {
    onRequest = function (request, response) {
      var
      postData = '',
      pathUrl = request.url,
      method = request.method.toLowerCase(),
      path = url.parse(pathUrl).pathname,
      cookies = cookieParser.parse(request.headers.cookie);
      request.setEncoding('utf8');
      request.addListener("data", function(postDataChunk) {
        postData += postDataChunk;
      });
      request.addListener("end", function() {
        route(handle, path, response, url.parse(pathUrl).query, method, cookies, postData);
      });
    };
    server = http.createServer(onRequest);
    server.listen(80);
  };

  return {init: init};
};
exports.init = server().init;
exports.init = server().init;