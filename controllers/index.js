const homeRoutes = require('./homeRoutes');

module.exports = function(app) {
    app.use('/', homeRoutes);
};