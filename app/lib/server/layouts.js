var path = require('path');
var fs = require('fs');
var dbutils = require('./utils/databaseutils.js');

module.exports = function(app, passport) {

    app.get('/api/layout/:id', function(req, res, next) {
        var did = req.params.id;
        dbutils.fileName(path.join(__dirname, '../data/layouts/'), did + '.json', req.user, function(err, file) {
            if (err) {
                var es = err.status || 400;
                return res.status(es).send(err.message);
            }
            res.status(200).sendFile(file);
        });

    });
	app.put('/api/layout/:id', function(req, res, next) {
        if (!req.body) return res.sendStatus(400);
        var did = req.params.id;
        dbutils.patchPath(path.join(__dirname, '../data/layouts/'), null, function(perr, filePath) {
            if (perr)
                res.status(400).send(perr.message);
            fs.appendFile(filePath + did + ".json", JSON.stringify(req.body, null, "\t"), {flag: "w"}, function(err) {
                if (err)
                    res.status(400).send(err.message);
                else
                    res.status(200).sendFile(path.join(__dirname, '../data/layouts/') + did + '.json');
            });
        });

    });

}


