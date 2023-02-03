const router = require('express').Router();
const { Project, User } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/dashboard');
    return;
  }

  res.render('login', { layout: 'landing' });
});

// Use withAuth middleware to prevent access to route
router.get('/dashboard', withAuth, async (req, res) => {
  Project.findAll({
    attributes: [
      'id',
      'title',
      'description',
      'progress',
      'deadline',
      'user_id',
    ],
    include: [
      {
        model: User,
        attributes: ['name'],
      },
    ],
  })
    .then((dbProjectData) => {
      const projects = dbProjectData.map((project) =>
        project.get({ plain: true })
      );
      // res.render('homepage', { projects }); //loggedIn: req.session.loggedIn
      res.render('layouts/dashboard', { projects });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/signup', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/dashboard');
    return;
  }

  res.render('signup', { layout: 'landing' });
});

router.get('/login', (req, res) => {
  res.render('login', { layout: 'landing' });
});


module.exports = router;
