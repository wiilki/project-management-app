const { User } = require('../models');

const userData = [
  {
    username: 'User Name1',
    email: 'user1@gmail.com',
    password: '123456',
  },
  {
    username: 'User Name2',
    email: 'user2@gmail.com',
    password: '123456',
  },
  {
    username: 'User Name3',
    email: 'user3@gmail.com',
    password: '123456',
  },
  {
    username: 'User Name4',
    email: 'user4@gmail.com',
    password: '123456',
  },
  {
    username: 'User Name5',
    email: 'user5@gmail.com',
    password: '123456',
  },
];

const seedUsers = () => User.bulkCreate(userData);

module.exports = seedUsers;
