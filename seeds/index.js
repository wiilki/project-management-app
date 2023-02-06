const seedProjects = require('./projectData');
const seedUsers = require('./userData');

const sequelize = require('../config/connection');

const seedDatabase = async () => {
  await sequelize.sync({ force: true });
  console.log('\n----- DATABASE SYNCED -----\n');

  await seedUsers();
  console.log('\n----- USERS SEEDED -----\n');

  await seedProjects();
  console.log('\n----- PROJECTS SEEDED -----\n');

  process.exit(0);
};

seedDatabase();