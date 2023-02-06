const router = require('express').Router();
const { User } = require('../../models');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');

// POST create a new user
router.post('/', asyncHandler(async (req, res) => {
  try {
    const userData = await User.create(req.body);
    req.session.user_id = userData.id;
    req.session.logged_in = true;
    req.session.email = userData.email;
    res.json({ success: true });
  } catch (err) {
    res.status(400).json(err);
  }
}));

router.post('/login', asyncHandler(async (req, res) => {
  try {
    const userData = await User.findOne({
      raw: true,
      where: { email: req.body.email },
    });
    if (!userData) {
      res.status(404).json({ message: 'Incorrect email or password, please try again' });
      return;
    }
    const validPassword = await bcrypt.compare(
      req.body.password,
      userData.password
    );
    if (!validPassword) {
      res.status(400).json({ message: 'Incorrect email or password, please try again' });
      return;
    }

    req.session.user_id = userData.id;
    req.session.logged_in = true;
    req.session.email = userData.email;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json(err);
  }
}));

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