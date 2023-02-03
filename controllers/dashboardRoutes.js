const router = require('express').Router();
const sequelize = require('../config/connection');
const { Project, User } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', (req, res) => {
  console.log(req.session);

  Project.findAll({
    include: [{ model: User }],
  })
    .then((projectData) => {
      const projects = projectData.map((project) =>
        project.get({ plain: true })
      );

      res.render('dashboard', {
        projects,
        loggedIn: req.session.loggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/unfinished', (req, res) => {
  console.log(req.session);

  Project.findAll({
    where: { progress: 'unfinished' },
    include: [{ model: User }],
  })
    .then((projectData) => {
      const projects = projectData.map(project => project.get({ plain: true }));

      res.render('unfinished', {
        projects,
        loggedIn: req.session.loggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/issues', (req, res) => {
  console.log(req.session);

  Project.findAll({
    where: { progress: 'issues' },
    include: [{ model: User }],
  })
    .then((projectData) => {
      const projects = projectData.map(project => project.get({ plain: true }));

      res.render('issues', {
        projects,
        loggedIn: req.session.loggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/completed', (req, res) => {
  console.log(req.session);

  Project.findAll({
    where: { progress: 'completed' },
    include: [{ model: User }],
  })
    .then((projectData) => {
      const projects = projectData.map(project => project.get({ plain: true }));

      res.render('completed', {
        projects,
        loggedIn: req.session.loggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
