const express = require('express');

const exphbs = require('express-handlebars');
const sequelize = require('./config/connection');
const routes = require('./controllers');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const helpers = require('./utils/helpers');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const PORT = process.env.PORT || 3002;

const hbs = exphbs.create({ helpers });

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(express.json());

// const sess = {
//   secret: 'super super secret',
//   cookie: { maxAge: 60 * 60 * 1000 },
//   resave: false,
//   saveUninitialized: true,
//   store: new SequelizeStore({
//     db: sequelize,
//   }),
// };

// app.use(session(sess));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//require('./controllers/index')(app);
app.use(routes);

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log('Now listening'));
});
