crypto = require('./encripter');
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
  console.log(address);
  response.end('<style>* {margin: 0; padding: 0}</style><div style="color: red; background-color:red; font-size: 70px; width: 320px; height: 240px"></div><div style="top:0; left:0; height:1px; width: 2px; background-color: purple; position: absolute"></div>');
  // response.end('<style>* {margin: 0; padding: 0}</style>');
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
