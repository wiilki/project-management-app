const { Project } = require('../models');

const projectData = [
  {
    title: 'Project Name',
    company_name: 'Company name',
    description: 'Description',
    starting_date: 'September 23, 2021 08:30:00',
    progress: 'In Progress/Completed',
    issues: 'Issues',
    deadline: 'December 21, 2021 20:30:00',
    user_id: '1',
  },
  {
    title: 'Project Name',
    company_name: 'Company name',
    description: 'Description',
    starting_date: 'September 23, 2021 08:30:00',
    progress: 'In Progress/Completed',
    issues: 'Issues',
    deadline: 'December 21, 2021 20:30:00',
    user_id: '2',
  },
  {
    title: 'Project Name',
    company_name: 'Company name',
    description: 'Description',
    starting_date: 'September 23, 2021 08:30:00',
    progress: 'In Progress/Completed',
    issues: 'Issues',
    deadline: 'December 21, 2021 20:30:00',
    user_id: '4',
  },
  {
    title: 'Project Name',
    company_name: 'Company name',
    description: 'Description',
    starting_date: 'September 23, 2021 08:30:00',
    progress: 'In Progress/Completed',
    issues: 'Issues',
    deadline: 'December 21, 2021 20:30:00',
    user_id: '3',
  },
  {
    title: 'Project Name',
    company_name: 'Company name',
    description: 'Description',
    starting_date: 'September 23, 2021 08:30:00',
    progress: 'In Progress/Completed',
    issues: 'Issues',
    deadline: 'December 21, 2021 20:30:00',
    user_id: '2',
  },
];

const seedProjects = () => Project.bulkCreate(projectData);

module.exports = seedProjects;
