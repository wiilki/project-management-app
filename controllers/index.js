const homeRoutes = require('./homeRoutes'); 
const apiRoutes = require('./api');

module.exports = function(app) {
    app.use('/', homeRoutes);
    app.use('./api', apiRoutes); 
};