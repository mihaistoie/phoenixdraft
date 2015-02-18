var layoutService = require('./layouts'); 
module.exports = function(app, passport) {
	layoutService(app, passport);
};

