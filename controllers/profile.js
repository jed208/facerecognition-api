const handleProfileGet = (req, res, db) => {
  const { id } = req.params;
  
  db.select('*')
    .from('users')
    .where({ id }) // with ES6, simply .where({id}) on a single line works because the property and value are the same
    .then(user => {
      if (user.length) {
        res.json(user[0])
      } else {
        res.status(400).json('Not found')
      }
    })
    .catch(err => res.status(400).json('Error getting user'))
}

module.exports = {
  handleProfileGet: handleProfileGet
}