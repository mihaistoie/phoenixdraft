var path = require('path');
var fs = require('fs');
var dbutils = require('./utils/databaseutils.js');

module.exports = function(app, passport) {

    app.get('/api/layout/:id', function(req, res, next) {
        var did = req.params.id;
        dbutils.fileName(path.join(__dirname, '../data/layouts/'), did + '.json', req.user, function(err, file) {
            if (err)
                return res.status(400).send(err.message);
            res.status(200).sendFile(file);
        });

    });


}
