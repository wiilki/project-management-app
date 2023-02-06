const router = require('express').Router();
const { Project, User } = require('../../models');
const sequelize = require('../../config/connection');
const withAuth = require('../../utils/auth');
const asyncHandler = require('express-async-handler');

router.get('/', asyncHandler(async (req, res) => {
  const projectData = await Project.findAll({
    include: [{ model: User }],
  });
  res.json(projectData);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const projectData = await Project.findOne({
    where: { id: req.params.id },
    include: [{ model: User }],
  });
  if (!projectData) {
    return res.status(404).json({ message: 'No projects found with this id' });
  }
  res.json(projectData);
}));

router.post('/', withAuth, asyncHandler(async (req, res) => {
  const newProject = await Project.create({
    ...req.body,
    user_id: req.session.user_id,
  });
  res.json({ newProject, success: true });
}));

router.put('/:id', withAuth, asyncHandler(async (req, res) => {
  await Project.update(req.body, {
    where: {
      id: req.params.id,
    },
  });
  res.json({ success: true });
}));

router.delete('/:id', withAuth, asyncHandler(async (req, res) => {
  await Project.destroy({
    where: {
      id: req.params.id,
    },
  });
  res.json({ success: true });
}));

module.exports = router;