const router = require("express").Router();
const { Project, User } = require("../models");
const withAuth = require("../utils/auth");
const async = require("async");

router.get("/", (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect("/dashboard");
    return;
  }

  res.render("login", { layout: "landing" });
});

// Use withAuth middleware to prevent access to route
router.get("/dashboard", withAuth, (req, res) => {
  async.parallel({
    users: (callback) => {
      User.findAll({ include: [{ model: Project }] })
        .then((userData) => {
          callback(null, userData.map((user) => user.get({ plain: true })));
        })
        .catch((err) => {
          callback(err);
        });
    },
    projects: (callback) => {
      Project.findAll({ include: [{ model: User }] })
        .then((projectData) => {
          callback(
            null,
            projectData.map((project) => project.get({ plain: true }))
          );
        })
        .catch((err) => {
          callback(err);
        });
    },
  }, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json(err);
    } else {
      res.render("dashboard", results);
    }
  });
});

router.get("/signup", (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect("/dashboard");
    return;
  }

  res.render("signup", { layout: "landing" });
});

router.get("/login", (req, res) => {
  res.render("login", { layout: "landing" });
});

module.exports = router;
