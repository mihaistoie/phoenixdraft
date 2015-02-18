var express = require('express');
var app = express();
var path = require('path');
var port = process.env.PORT || 9000;
var bodyParser = require('body-parser');
var routes = require('./server/routes.js');
console.log(__dirname);
app.use(express.static(path.join(__dirname, 'public')));
// launch 
app.use(bodyParser.json({
    strict: true,
    limit: 1024*1024*1024
}));
// routes 
routes(app, null); 
app.listen(port);
console.log('The magic happens on port ' + port);
