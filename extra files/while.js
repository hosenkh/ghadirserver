net = require('net');
bmp = require('bmp-js');
phantom = require('phantom');
fs = require('fs');
HOST = '0.0.0.0';
PORT = '1234';
sitepage = null;
phInstance = null;
net.createServer(function(socket) {
  console.log('connected '+ socket.remoteAddress);
  socket.on('data', function(data) {
    console.log(JSON.stringify(data));
    mainData = JSON.parse(JSON.stringify(data)).data;
    mainChar = '';
    for (i=0;i<mainData.length-2;i++) {
      mainChar += String.fromCharCode(parseInt(mainData[i].toString(16), 16));
    }
    console.log(mainChar);
    if (mainChar == 1) {
      a = true;
      t = 1000;
      f = function() {
        setTimeout(function(){t=500; console.log(mainChar); if (a) {f();}}, t);
      };
      f();
    } else {
      a = false;
    }

  });

}).listen(PORT, HOST);