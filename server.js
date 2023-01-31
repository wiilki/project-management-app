const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const connection = require('./config/connection');

const PORT = process.env.PORT || 3001;

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(express.json());

require('./controllers/index')(app);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);