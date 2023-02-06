const { Project } = require('../models');

const projectData = [
  {
    title: 'Project Bishop Ring',
    description: 'Space Habitat concept for living in space.',
    progress: 'In Progress',
    deadline: '10/30/2552',
    user_id: 1
  },
  {
    title: 'Project Death Star',
    description:
      'The Death Star project is a demonstration of the fusion of technological advancement and military might, and its impact will be felt throughout the galaxy.',
    progress: 'In Progress',
    deadline: '07/21/3298',
    user_id: 2
  },
  {
    title: 'Project Dyson Sphere',
    description:
      'Megastructure constructed around a star, to collect the entirety of sauser_id star’s energy output.',
    progress: 'Completed',
    deadline: '02/10/3023',
    user_id: 3
  },
  {
    title: 'Project Shkadov Thruster',
    description:
      'Renovating your solar system? Have we got a solution for you!',
    progress: 'Issues',
    deadline: '12/31/9999',
    user_id: 4
  },
  {
    title: 'Project Elevate',
    description:
      'An anchored tether that extends into low orbit, allowing a car to carry people and cargo into space.',
    progress: 'In Review',
    deadline: '04/01/2090',
    user_id: 4
  },
  {
    title: 'Project Andromeda',
    description: 'Hyperdrive powered exploration ship.',
    progress: 'In Progress',
    deadline: '09/22/3032',
    user_id: 1
  },
  {
    title: 'Project Ganymede',
    description: 'Lunar mining and settlement project.',
    progress: 'Issues',
    deadline: '07/01/2560',
    user_id: 2
  },
  {
    title: 'Project Hyperion',
    description:
      'The Hyperion project is an ambitious attempt to reach the stars by developing advanced propulsion technologies.',
    progress: 'Completed',
    deadline: '08/15/2126',
    user_id: 3
  },
  {
    title: 'Project Icarus',
    description:
      'A project to develop a fusion-powered interstellar human transport ship capable of reaching the stars.',
    progress: 'In Progress',
    deadline: '11/19/3017',
    user_id: 4
  },
  {
    title: 'Project Jupiter',
    description:
      'A human settlement on the planet Jupiter, harnessing the abundant resources and energy to create a sustainable environment.',
    progress: 'Issues',
    deadline: '01/22/3054',
    user_id: 1
  },
  {
    title: 'Project Kepler',
    description:
      'A deep-space transportation system that uses advanced gravity wave technology to bridge the gap between two points in the universe.',
    progress: 'Completed',
    deadline: '06/15/2060',
    user_id: 2
  },
  {
    title: 'Project Leviathan',
    description:
      'A robotic exploration mission to investigate the vast reaches of the universe.',
    progress: 'In Progress',
    deadline: '02/02/4040',
    user_id: 3
  },
];

const seedProjects = () => Project.bulkCreate(projectData);

module.exports = seedProjects;
