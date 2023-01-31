const { User } = require('../models');

const userData = [
    {
        name: 'User Name',
        starting_date: 'Date',
        deadline: 'Date',
    },
    {
        name: 'User Name',
        starting_date: 'Date',
        deadline: 'Date',
    },
    {
        name: 'User Name',
        starting_date: 'Date',
        deadline: 'Date',
    },
    {
        name: 'User Name',
        starting_date: 'Date',
        deadline: 'Date',
    },
    {
        name: 'User Name',
        starting_date: 'Date',
        deadline: 'Date',
    },
];

const seedUsers = () => User.bulkcreate(userData);

module.exports = seedUsers;