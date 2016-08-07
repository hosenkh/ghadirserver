net = require('net');
bmp = require('bmp-js');
phantom = require('phantom');
fs = require('fs');
HOST = '0.0.0.0';
PORT = '1234';
sitepage = null;
phInstance = null;
var cStatus;
net.createServer(function(socket) {
  console.log('connected '+ socket.remoteAddress);
  socket.on('data', function(data) {
    // console.log(JSON.stringify(data));
    mainData = JSON.parse(JSON.stringify(data)).data;
    mainChar = '';
    // var cStatus = false;
    for (i=0;i<mainData.length-2;i++) {
      mainChar += String.fromCharCode(parseInt(mainData[i].toString(16), 16));
    }
    console.log(mainChar);
    if (mainChar.match(/userId=[0-9]+&deviceId=[0-9]+/g)) {
      requestData = mainChar.split('&');
      userId = requestData[0].split('=')[1];
      deviceId = requestData[1].split('=')[1];
      mainChar = '';
      timeout = 2000;
      cStatus = true;
      phCreateInstance = phantom.create()
          .then(instance => {
              phInstance = instance;
              return instance.createPage();
          }).catch(function(error){
              if (error) {
                console.log(error);
                phInstance.exit();
              }
          });
        phOpenPage=phCreateInstance.then(page => {
              sitepage = page;
              sitepage.property('viewportSize', {width: 320, height: 240});
              return page.open('http://localhost/?userId='+userId+'&deviceId='+deviceId);
          }).catch(function(error){
              if (error) {
                console.log(error);
                phInstance.exit();
              }
          });
        phGetStatus = phOpenPage.then(status => {
              console.log(status);
              return sitepage.property('content');
          }).catch(function(error){
              if (error) {
                console.log(error);
                phInstance.exit();
              }
          });
      loop = function(){
        setTimeout(
          function() {
            if (cStatus) {
              phRender = phGetStatus.then(content => {
                    // sitepage.render('test.bmp');
                    b = sitepage.renderBase64('BMP');
                    return b;
                }).catch(function(error){
                    if (error) {
                      console.log(error);
                      phInstance.exit();
                    }
                });
              phPixel = phRender.then(b => {
                    buf = new Buffer(b, 'base64');
                    decoded = bmp.decode(buf);
                    hexer = function (x,shift) {
                      var num = parseInt(x);
                      var shiftedNum;
                      switch (shift) {
                        case 11:
                          shiftedNum = (num*249+1014) >> 11;
                        break;
                        case 10:
                          shiftedNum = (num*253+505) >> 10;
                        break;
                      }
                      return shiftedNum.toString(16);
                    };
                    // console.log(decoded);
                    // rawArray= JSON.parse(JSON.stringify(decoded)).data.data;
                    rawPixels= JSON.stringify(decoded).split("[")[1].split("]")[0].replace(/(\d+),(\d+),(\d+),255/g, function(a,b,c,d){return "0x"+hexer(b,11)+hexer(c,10)+hexer(d,11);});
                    // fs.writeFile('array.txt', rawPixels, function(err) {
                    //   if (err) {
                    //     console.log(err);
                    //   }
                    // });
                    // cutIndex = 0;
                    // for (var i in rawArray) {
                    //   if (fourIndex == 4) {
                    //     fourIndex= 0;
                    //   }
                    //   if (fourIndex == 3) {
                    //     rawArray.splice(i-cutIndex, 1);
                    //     cutIndex ++;
                    //   }
                    //   fourIndex ++;
                    // }
                    // cutIndex = 0;
                    // console.log(rawText.slice(1,rawText.length-1));
                    return rawPixels;
                }).catch(function(error){
                    if (error) {
                      console.log(error);
                      phInstance.exit();
                    }
                });
                phExport = phPixel.then(rawPixels => {
                try {socket.write(rawPixels);}
                catch (err){
                  console.log(err);
                }
                  if (cStatus) {
                    loop();
                  }
                    // fs.writeFile('buf.txt', JSON.stringify(rawArray), function(err) {
                    //   if (err) {
                    //     console.log(err);
                    //   }
                    // });
                }).catch(function(error){
                    if (error) {
                      console.log(error);
                      phInstance.exit();
                    }
                });
            }
            
            
            
          },timeout);
      };
      loop();
      
    } else {
      if (cStatus) {
        meParam = mainChar.split(',');
        if (meParam[0] == 'mousedown' || meParam[0] == 'mouseup' || meParam[0] == 'mousemove' || meParam[0] == 'click') {
          console.log(meParam);
          phGetStatus.then(content => {
              sitepage.sendEvent(meParam[0], meParam[1], meParam[2]);
          }).catch(function(error){
              if (error) {
                console.log(error);
                phInstance.exit();
              }
          });
        } else {
          console.log('wrong input');
        }
      } else {
        console.log('wrong input');
      }

    }

  });
  socket.on('close', function() {
    cStatus = false;
      phExport.then(() => {
        sitepage.close();
        phInstance.exit();
      }).catch(function(error){
          if (error) {
            console.log(error);
            phInstance.exit();
          }
      });
    console.log('close');
  });

}).listen(PORT, HOST);