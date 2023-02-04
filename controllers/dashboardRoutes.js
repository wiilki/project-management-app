const router = require("express").Router();
const sequelize = require("../config/connection");
const { Project, User } = require("../models");
const withAuth = require('../utils/auth');

router.get('/create/', withAuth, (req, res) => {
  Project.findAll({
    attributes: [
      'id',
      'title',
      'description',
      // 'progress',
      'deadline'
    ],
    include: [
      { model: User },
    ]
  })
    .then(projectData => {
      // serialize data before passing to template
      const projects = projectData.map(project => project.get({ plain: true }));
      res.render('newProject', { projects, loggedIn: true });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/edit/:id', withAuth, (req, res) => {
  Project.findOne({
    where: {
      id: req.params.id
    }
  })
    .then(projectData => {
      if (!projectData) {
        res.status(404).json({ message: 'No project found with this id' });
        return;
      }

      const project = projectData.get({ plain: true });

      res.render('editProject', {
        project,
        loggedIn: true
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/unfinished', withAuth, async (req, res) => {
  Project.findAll({
    where: { progress: "unfinished" },
    include: [
      { model: User }],
  })
    .then((projectData) => {
      const projects = projectData.map((project) =>
        project.get({ plain: true })
      );

      res.render('dashboard', { projects });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/issues', withAuth, async (req, res) => {
  Project.findAll({
    where: { progress: "issues" },
    include: [
      { model: User }],
  })
    .then((projectData) => {
      const projects = projectData.map((project) =>
        project.get({ plain: true })
      );

      res.render('dashboard', { projects });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/completed', withAuth, async (req, res) => {
  Project.findAll({
    where: { progress: "completed" },
    include: [
      { model: User }],
  })
    .then((projectData) => {
      const projects = projectData.map((project) =>
        project.get({ plain: true })
      );

      res.render('dashboard', { projects });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/will', withAuth, async (req, res) => {
  Project.findAll({
    include: [
      {
        model: User,
        where: { name: "Will" }
      }]

  })
    .then((projectData) => {
      const projects = projectData.map((project) =>
        project.get({ plain: true })
      );

      res.render('dashboard', { projects });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/jose', withAuth, async (req, res) => {
  Project.findAll({
    include: [
      {
        model: User,
        where: { name: "Jose" }
      }]
  })
    .then((projectData) => {
      const projects = projectData.map((project) =>
        project.get({ plain: true })
      );

      res.render('dashboard', { projects });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/mab', withAuth, async (req, res) => {
  Project.findAll({
    include: [
      {
        model: User,
        where: { name: "Mab" }
      }]
  })
    .then((projectData) => {
      const projects = projectData.map((project) =>
        project.get({ plain: true })
      );

      res.render('dashboard', { projects });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/francisco', withAuth, async (req, res) => {
  Project.findAll({
    include: [
      {
        model: User,
        where: { name: "Francisco" }
      }]
  })
    .then((projectData) => {
      const projects = projectData.map((project) =>
        project.get({ plain: true })
      );

      res.render('dashboard', { projects });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/dean', withAuth, async (req, res) => {
  Project.findAll({
    include: [
      {
        model: User,
        where: { name: "Dean" }
      }]
  })
    .then((projectData) => {
      const projects = projectData.map((project) =>
        project.get({ plain: true })
      );

      res.render('dashboard', { projects });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});


module.exports = router;
