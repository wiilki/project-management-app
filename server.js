const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const connection = require('./config/connection');

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

require('./controllers/index')(app);

app.listen(3001, () => {
    console.log('Server started on port 3001');
});