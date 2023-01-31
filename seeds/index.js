const sequelize = require('../config/connection');
const seedProjects = require('./projectData');
const seedUsers = require('./userData');

const seedAll = async () => {
  await sequelize.sync({ force: true });

  await seedUsers();
  await seedProjects();

  process.exit(0);
};

seedAll();
