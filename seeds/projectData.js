const { Project } = require('../models');

const projectData = [
  {
    title: 'Project Bishop Ring',
    description: 'Space Habitat concept for living in space.',
    progress: 'Unfinished',
    deadline: '10/30/2552',
    user_id: 1
  },
  {
    title: 'Project Death Star',
    description:
      'The Death Star project is a demonstration of the fusion of technological advancement and military might, and its impact will be felt throughout the galaxy.',
    progress: 'Unfinished',
    deadline: '07/21/3298',
    user_id: 2
  },
  {
    title: 'Project Dyson Sphere',
    description:
      'Megastructure constructed around a star, to collect the entirety of sauser_id star’s energy output.',
    progress: 'completed',
    deadline: '02/10/3023',
    user_id: 3
  },
  {
    title: 'Project Shkadov Thruster',
    description:
      'Renovating your solar system? Have we got a solution for you!',
    progress: 'issues',
    deadline: '12/31/9999',
    user_id: 4
  },
  {
    title: 'Project Elevate',
    description:
      'An anchored tether that extends into low orbit, allowing a car to carry people and cargo into space.',
    progress: 'issues',
    deadline: '04/01/2090',
    user_id: 5
  },
];

const seedProjects = () => Project.bulkCreate(projectData);

module.exports = seedProjects;
