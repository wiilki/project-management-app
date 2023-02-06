const path = require("path");
const express = require("express");
const session = require("express-session");
const exphbs = require("express-handlebars");
const { SequelizeStore } = require("connect-session-sequelize");
const sequelize = require("./config/connection");
const routes = require("./controllers");
const helpers = require("./utils/helpers");

const app = express();
const PORT = process.env.PORT || 3001;

const hbs = exphbs.create({ helpers });
// const store = new SequelizeStore({ db: sequelize });

// store.sync();

app.use(session({
  secret: "for group 6 only",
  cookie: {
    expires: 10 * 60 * 1000,
  },
  resave: false,
  rolling: true,
  saveUninitialized: true,
  // store,
}));

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(routes);
app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT} 🚀`));
