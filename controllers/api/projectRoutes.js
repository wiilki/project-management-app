const router = require('express').Router();
const { Project, User } = require('../../models');
const withAuth = require('../../utils/auth');

// router.get('/', (req, res) => {
//   //res.render('create');
//   res.send('project');
// });

// get all projects

router.get('/', (req, res) => {
  Project.findAll({
    attributes: [
      'id',
      'title',
      'company_name',
      'description',
      'starting_date',
      'progress',
      'issues',
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
      res.render('dashboard', { projects }); //loggedIn: req.session.loggedIn
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});
// // get project by id
// router.get('/:id', withAuth, async (req, res) => {
//   try {
//     const projectId = await Project.findOne({
//       where: { id: req.params.id },
//       include: [
//         { model: Project, attributes: ['id', 'title', 'starting_date'] },
//       ],
//     });
//     if (!projectId) {
//       res.status(404).json({ message: 'No project found with this id!' });
//       return;
//     }
//     res.status(200).json(projectId);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // create new project
// router.post('/', withAuth, async (req, res) => {
//   try {
//     const newProject = await Project.create({
//       ...req.body,
//       user_id: req.session.user_id,
//     });

//     res.status(200).json(newProject);
//   } catch (err) {
//     res.status(400).json(err);
//   }
// });

// // update project

// router.put('/:id', withAuth, async (req, res) => {
//   try {
//     const projectId = await Project.update(
//       {
//         // need more from models
//         title: req.body.title,
//       },
//       {
//         where: {
//           id: req.params.id,
//         },
//       }
//     );

//     if (!projectId) {
//       res.status(404).json({ message: 'No project found with this id!' });
//       return;
//     }

//     res.json(projectId);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // delete project

// router.delete('/:id', withAuth, async (req, res) => {
//   try {
//     const projectData = await Project.destroy({
//       where: {
//         id: req.params.id,
//         user_id: req.session.user_id,
//       },
//     });

//     if (!projectData) {
//       res.status(404).json({ message: 'No project found with this id!' });
//       return;
//     }

//     res.status(200).json(projectData);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

module.exports = router;
