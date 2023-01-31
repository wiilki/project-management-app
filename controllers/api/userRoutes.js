const router = require('express').Router();
const { User } = require('../../models');
const withAuth = require('../../utils/auth');

router.get('/', (req, res) => {});
router.get('/login', (req, res) => {res.render('login')});

router.post('/login', (req, res) => {
  console.log(req.body)
});

router.post('/', (req, res) => {
  console.log(req.body)
});

module.exports = router 