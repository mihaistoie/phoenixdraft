var path = require('path');
var fs = require('fs');
var dbutils = require('./utils/databaseutils.js');

module.exports = function(app, passport) {
    function sendToolbox(tn, req, res) {
        dbutils.fileName(path.join(__dirname, '../data/toolboxes/'), tn + '.json', req.user, function(err, file) {
            if (err) {
                var es = err.status || 400;
                return res.status(es).send(err.message);
            }
            res.status(200).sendFile(file);
        });

    }
    app.get('/api/toolbox', function(req, res, next) {
        sendToolbox('default', req, res) 
    });
    app.get('/api/toolbox/:id', function(req, res, next) {
        var did = req.params.id;
        sendToolbox(did, req, res) 
    });

}

