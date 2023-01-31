const router = require('express').Router();
const { User } = require('../../models');
const withAuth = require('../../utils/auth');

// for test (have user in database or not)
router.get('/', (req, res) => {
  User.findAll({
    attributes: { exclude: ['[password'] },
  })
    .then((dbUserData) => res.json(dbUserData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// create user
router.post('/', async (req, res) => {
  try {
    const userData = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });
    // req.session.save(() => {
    //   req.session.user_id = userData.id;
    //   req.session.logged_in = true;

    res.status(200).json(userData);
    // });
  } catch (err) {
    res.status(400).json(err);
  }
});

// log in
router.post('/login', async (req, res) => {
  try {
    const userData = await User.findOne({ where: { email: req.body.email } });
    console.log(userData);
    if (!userData) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.json({ user: userData, message: 'You are now logged in!' });
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

// log out
router.post('/logout', (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;
=======
router.get('/', (req, res) => {});
router.get('/login', (req, res) => {res.render('login')});

router.post('/login', (req, res) => {
    console.log(req.body)
});

router.post('/', (req, res) => {
    console.log(req.body)
});

module.exports = router