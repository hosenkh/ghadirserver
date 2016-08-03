crypto = require('./encripter');
fileLoader = require('./fileLoader');
querystring = require('querystring');
databaseHandler = require('./databaseHandler');

addressPurifier = function (address) {
  address = address.toString();
  var
  pathnameArray = address.toString().split('/').shift().shift();
  var purePath = '';
  for (var i in pathnameArray) {
    purePath += '/'+pathnameArray[i];
  }
  return purePath;
};

queryParser = function (query) {
  var
  splittedQuery = [],
  parsedQuery = {};
  if (query) {
    splittedQuery = query.split('&');
    parsedQuery = {};
    for (var i in splittedQuery) {
      var command = splittedQuery[i].split('=');
      parsedQuery[command[0]] = command[1];
    }
  }
  return parsedQuery;
};


main = function (response, address, cookies) {
  var tempPath = address;
  if (tempPath === '/') {
    tempPath += 'index.html';
  }
  fileLoader.load(response, '',tempPath, cookies);
};


db = function (response, address, queryOptions, method, cookies, postData) {
  username = userDecryptor(cookies);
  queryObj = querystring.parse(queryOptions);
  requestData = JSON.parse(postData);
  if (method == 'get') {
    databaseHandler.showLink(username, queryObj.menu, function(results) {
      response.write(results);
      response.end();
    });
  }
  if (method == 'post') {
    databaseHandler.dbRequest(username, requestData.selectionArray, requestData.command, requestData.data, function(results) {
      if (userDecryptor(cookies) != 'public') {
        response.writeHead(200, {
          'set-cookie': 'user='+cookies.user+';httpOnly=true;expires='+new Date(new Date().getTime()+600000).toUTCString()
        });
      }
      response.write('a'+JSON.stringify(results));
      response.end();
    });
  }
};


device = function (response, address, queryOptions, method) {
  console.log(address);
  response.writeHead(200);
  if (queryOptions) {
    queryObj = querystring.parse(queryOptions);
    console.log(queryObj);
    if (queryObj.d_id && queryObj.u_id && queryObj.status && queryObj.answer) {
      response.end('hi');
    } else {
      response.end('insufficient information');
    }
  } else {
    response.end('no query');
  }
};

exports['main'] = main;
exports['db'] = db;
exports['device'] = device;
