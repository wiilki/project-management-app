const homeRoutes = require('./homeRoutes');
const apiRoutes = require('./api/index.js');

module.exports = function(app) {
    app.use('/', homeRoutes);
    app.use('/api', apiRoutes);
};