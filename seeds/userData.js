const { User } = require('../models');

const userData = [
  {
    name: 'Jose',
    email: 'JoseA@gmail.com',
    password: '12345678',
  },
  {
    name: 'Dean',
    email: 'DPaul@gmail.com',
    password: '12345678',
  },
  {
    name: 'Mab',
    email: 'MabC@gmail.com',
    password: '12345678',
  },
  {
    name: 'Will',
    email: 'WillK@gmail.com',
    password: '12345678',
  },
  {
    name: 'Francisco',
    email: 'FrankM@gmail.com',
    password: '12345678',
  },
];

const seedUsers = () => User.bulkCreate(userData, {
  individualHooks: true,
  returning: true,
});;

module.exports = seedUsers;
