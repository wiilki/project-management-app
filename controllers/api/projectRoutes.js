const router = require("express").Router();
const { Project, User } = require("../../models");
const sequelize = require("../../config/connection");
const withAuth = require("../../utils/auth");

router.get("/", (req, res) => {
  Project.findAll({
    include: [ { model: User },
    ],
  })
    .then((projectData) => res.json(projectData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post("/", withAuth, async (req, res) => {
  const newProject = await Project.create({
    title: req.body.title,
    description: req.body.description,
    progress: req.body.progress,
    deadline: req.body.deadline,
    user_id: req.session.user_id,
  })
    .then((projectData) => res.json(projectData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get("/:id", (req, res) => {
  Project.findOne({
    where: { id: req.params.id },
    include: [{ model: User }],
  })
    .then((projectData) => {
      if (!projectData) {
        res.status(404).json({ message: "No projects found with this id" });
        return;
      }
      res.json(projectData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.put("/:id", withAuth, (req, res) => {
  Project.update(
    {
      title: req.body.title,
      description: req.body.description,
      progress: req.body.progress,
      deadline: req.body.deadline,
    },
    { where: { id: req.params.id } }
  )
    .then((projectData) => {
      if (!projectData) {
        res.status(404).json({ message: "No projects found with this id" });
        return;
      }
      res.json(projectData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.delete("/:id", withAuth, (req, res) => {
  Project.destroy({
    where: { id: req.params.id },
  })
    .then((projectData) => {
      if (!projectData) {
        res.status(404).json({ message: "No projects found with this id" });
        return;
      }
      res.json(projectData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
