// const homeRoutes = require('./homeRoutes');

// module.exports = function(app) {
//     app.use('/', homeRoutes);
// };

const router = require('express').Router();

const homeRoutes = require('./homeRoutes.js');
const apiRoutes = require('./api');

router.use('/', homeRoutes);
router.use('/api', apiRoutes);

module.exports = router;
