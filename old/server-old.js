const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs'); // needed to encrypt passwords
const cors = require('cors');
const knex = require('knex'); // needed to connect front-end to database
const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'secret123',
    database : 'smartbrain'
  }
});

// just like postgreSQL command
// (i.e. SELECT * FROM users;)
db.select('*').from('users').then(data => {
  console.log(data);
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

// const database = {
//   users: [
//     {
//       id: '123',
//       name: 'John',
//       email: 'john@gmail.com',
//       password: '11',
//       entries: 208,
//       joined: new Date()
//     },
//     {
//       id: '124',
//       name: 'Sally',
//       email: 'sally@gmail.com',
//       password: '22',
//       entries: 0,
//       joined: new Date()
//     }
//   ]
// };

app.get('/', (req, res) => {
  res.send(database.users);
  // res.send('this is working');
  // res.json('this is working'); // same as above but with ""
})

app.post('/signin', (req, res) => {
  db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {        
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', req.body.email)
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json('Unable to get user'))
      } else {
        res.status(400).json('Wrong credentials')
      }
    })
    .catch(err => res.status(400).json('Wrong credentials'))
  // BCRYPT CODE
  // // Load hash from your password DB.
  // bcrypt.compare("apples", '$2a$10$fE/u4UzBz2oP8aB/q0ET/uQtq/A6wkFK2EMZtUETqULCqS/f.PYKm', function(err, res) {
  //   console.log('first guess', res)
  // });
  // bcrypt.compare("veggies", '$2a$10$fE/u4UzBz2oP8aB/q0ET/uQtq/A6wkFK2EMZtUETqULCqS/f.PYKm', function(err, res) {
  //   console.log('second guess', res)
  // });

  /* OLD CODE PRIOR TO DATABASE
  if (req.body.email === database.users[0].email && 
    req.body.password === database.users[0].password) {
      res.json(database.users[0]);
  } else {
    res.status(400).json('Error logging in');
  } */

  // line below not needed...?
  // res.json('signin success'); --> initial check
})

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  const hash = bcrypt.hashSync(password);

  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
    .into('login')
    .returning('email')
    .then(loginEmail => {
      return trx('users')
        .returning('*')
        .insert({
          name: name,
          email: loginEmail[0],
          joined: new Date()
        })
        .then(user => {
          res.json(user[0]);
        })
    })
    .then(trx.commit)
    .catch(trx.rollback)
  })
  .catch(err => res.status(400).json('unable to register'))
  // BCRYPT CODE
  // bcrypt.hash(password, null, null, function(err, hash) {
  //   console.log(hash);
  // });
  /* OLD CODE PRIOR TO CONNECTING TO ACTUAL DATABASE
  database.users.push({
    id: '125',
    name: name,
    email: email,
    // password: password, --> typically don't show this
    entries: 0,
    joined: new Date()
  }) */
  // res.json('registration success'); --> initial check
})

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  // NO LONGER NEEDED AS AN EMPTY ARRAY WILL BE RETURNED IF NOT FOUND
  // let found = false; // this needs to be a let as it will be reassigned
  
  db.select('*')
    .from('users')
    .where({ // with ES6, simply .where({id}) on a single line works because the property and value are the same
      id: id
    })
    .then(user => {
      if (user.length) {
        res.json(user[0])
      } else {
        res.status(400).json('Not found')
      }
    })
    .catch(err => res.status(400).json('Error getting user'))

  /* OLD CODE PRIOR TO CONNECTING TO ACTUAL DATABASE
  database.users.forEach(user => {
    if (user.id === id) {
      found = true;
      return res.json(user);
    }
  }) */
  // NO LONGER NEEDED AS AN EMPTY ARRAY WILL BE RETURNED IF NOT FOUND
  // if (!found) {
  //   res.status(400).json('not found');
  // }
})

app.put('/image', (req, res) => {
  const { id } = req.body;
  
  db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0])
    })
    .catch(err => res.status(400).json('Unable to get entries'))

  /* OLD CODE PRIOR TO CONNECTING TO DATABASE
  let foundUser = false; // this needs to be a let as it will be reassigned
  database.users.forEach(user => {
    if (user.id === id) {
      foundUser = true;
      user.entries++;
      return res.json(user.entries);
    }
  })
  if (!found) {
    res.status(400).json('not found');
  } */
})





app.listen(3000, () => {
  console.log('app is running on port 3000');
})

/* 
/ --> res = this is working
/signin --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user

*/ 