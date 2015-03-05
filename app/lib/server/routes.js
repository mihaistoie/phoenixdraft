var layoutService = require('./layouts'); 
var toolboxService = require('./toolbox'); 
module.exports = function(app, passport) {
	layoutService(app, passport);
	toolboxService(app, passport);
};

