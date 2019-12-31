require('module-alias/register');
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const Cors = require('cors');

const posts = require('./routes/posts');
const root = require('./routes/root');
const accounts = require('./routes/accounts');
const comments = require('./routes/comments');
const auth = require('./routes/auth');
const mySql = require('./db/mySql');
const mongo = require('./db/mongo');

const passport = require('./services/auth/passport');

const port = 3000;

mySql.initDb();
mongo.initDb();

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(Cors());

app.use('/', root);
app.use('/auth', auth);
app.use('/posts', passport.authenticate('jwt', {session: true}), posts);
app.use('/accounts', passport.authenticate('jwt', {session: true}), accounts);
app.use('/comments', passport.authenticate('jwt', {session: true}), comments);

app.listen(port, (err: any) => {
  if (err) {
    console.log('Error listening: ', err);
    mySql.closeDb().then(() => {
      console.log('Terminating connection to Db');
    });
  }
  console.log(`Server is listening on ${port}`);
})
