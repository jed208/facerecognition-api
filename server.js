const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs'); // needed to encrypt passwords
const cors = require('cors');
const knex = require('knex'); // needed to connect front-end to database

const signin = require('./controllers/signin');
const register = require('./controllers/register');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'secret123',
    database : 'smartbrain'
  }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

/* RESPONSE - SEND USER DATA */
app.get('/', (req, res) => { res.send(database.users); })
/* SIGN-IN --> POST */
// includes dependencies injection to pass db and bcrypt to register.js
app.post('/signin', (req, res) => { signin.handleSignIn(req, res, db, bcrypt) })
/* REGISTER --> POST */
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })
/* GET PROFILE ID --> GET */
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db) })
/* UPDATE ENTRY COUNT WHEN IMAGES ARE POSTED --> PUT */
// this next line uses advance JS functions - looks cleaner but can be more confusing
app.put('/image', image.handleImage(db))
// next line is to get Clarifai working - uncomment when solved
// app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) })

app.listen(3000, () => {
  console.log('app is running on port 3000');
})
