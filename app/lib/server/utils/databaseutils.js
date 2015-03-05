var fs = require('fs');
var path = require('path');

function patchWritePath(filePath, user, done) {
    if (!user || user.isAdmin) {
        return done(null, filePath);
    }
    filePath = path.join(filePath, user.name + '/');
    fs.exists(filePath, function(exists) {
        if (exists)
            return done(null, filePath);
        fs.mkdir(filePath, function(err) {
            done(err, filePath);
        });
    });
}

function patchReadPath(filePath, fileName, user, done) {
    if (!user || user.isAdmin) {
        return done(null, path.join(filePath, fileName));
    }
    var file = path.join(filePath, user.name + '/' + fileName);
    fs.exists(file, function(exists) {
        if (exists)
            return done(null, file);

        file = path.join(filePath, fileName);
        fs.exists(file, function(exists) {
            if (exists)
                return done(null, file);
            else
                return done({
                    message: "File not found.",
                    status: 404
                }, null);
        });
    });
}


module.exports = {
    patchPath: patchWritePath,
    fileName: patchReadPath
};
