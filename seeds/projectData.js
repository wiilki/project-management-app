const { Project } = require('../models');

const projectData = [
    {
        name: 'Project Name',
        company_name: 'Company name',
        description: 'Description',
        starting_date: 'Start Date',
        progress: 'In Progress/Completed',
        issues: 'Issues',
        deadline: 'Deadline Date',
        user_id: 'ID',
    },
    {
        name: 'Project Name',
        company_name: 'Company name',
        description: 'Description',
        starting_date: 'Start Date',
        progress: 'In Progress/Completed',
        issues: 'Issues',
        deadline: 'Deadline Date',
        user_id: 'ID',
    },
    {
        name: 'Project Name',
        company_name: 'Company name',
        description: 'Description',
        starting_date: 'Start Date',
        progress: 'In Progress/Completed',
        issues: 'Issues',
        deadline: 'Deadline Date',
        user_id: 'ID',
    },
    {
        name: 'Project Name',
        company_name: 'Company name',
        description: 'Description',
        starting_date: 'Start Date',
        progress: 'In Progress/Completed',
        issues: 'Issues',
        deadline: 'Deadline Date',
        user_id: 'ID',
    },
    {
        name: 'Project Name',
        company_name: 'Company name',
        description: 'Description',
        starting_date: 'Start Date',
        progress: 'In Progress/Completed',
        issues: 'Issues',
        deadline: 'Deadline Date',
        user_id: 'ID',
    },
];

const seedProjects = () => Project.bulkcreate(projectData);

module.exports = seedProjects;