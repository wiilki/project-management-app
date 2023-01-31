const router = require('express').Router();
const { Project, User } = require('../models');

router.get('/', async (req, res) => {
  try {
    const dbProject = await User.findAll();
    console.log(dbProject);
    // const projects = dbProject.map((project) => {
    //   project.get({ plain: true });
    // });
    res.json(dbProjects);
    // res.render('homepage', {
    //   projects,
    //   //   //loggedIn: req.session.loggedIn,
    // });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.get('/login', (req, res) => {
  //   if (req.session.loggedIn) {
  //     res.redirect('/');
  //     return;
  //   }

  res.render('login');
});


module.exports = router;
=======
router.get('/login', (req, res) => {
    res.render('login');
});