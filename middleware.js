'use strict';
var http = require('http');
var url = require('url');

function Middleware() {
  this.server = http.createServer(function(req, res) {
    var _this = this;
    var end = false;

    req.on('close', function() { end = true });

    var process = function(index) {
      if (end) {
        return;
      }
      for (var i=index,len=_this.handlers.length; i<len; i=i+1) {
        var handler = _this.handlers[i];
        if (handler.path === null || handler.path === url.parse(req.url).path) {
          handler.callback(req, res, function() { process(i+1); })
          return;
        }
      }
    };
    process(0);

  }.bind(this));

  this.handlers = [];
}

function createServer() {
  return new Middleware();
}

Middleware.prototype.use = function(firstParams, callback) {
  if(typeof(firstParams) === 'string') {
    this.handlers.push({
      path: firstParams,
      callback: callback
    });
  }else {
    this.handlers.push({
      path: null,
      callback: firstParams
    });
  }
}

Middleware.prototype.listen = function(port, callback) {
  this.server.listen(port, '127.0.0.1', 511, callback);
}

exports.createServer = createServer;
