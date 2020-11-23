

/* NEXT SECTION OF CODE IS FOR CLARIFAI
- CLARIFAI SECTION NEEDS TO BE SOLVED STILL
- MOVED TO BACKEND FROM FRONTEND FOR SECURITY
  - otherwise api key can be seen in network
- see 'Production + Deployment' > 'Security Review' video for code
const Clarifai = require('clarifai');

// You must add your own API key here from Clarifai
const app = new Clarifai.app({
  apiKey: ''
})

const handleApiCall = (req, res) => {
  app.models
    .predict(
      Clarifai.FACE_DETECT_MODEL,
      req.body.input
    )
    .then(data => {
      res.json(data);
    })
    .catch(err => res.status(400).json('Unable to work with API'))
}
*/

// this next line uses advance JS functions - can look cleaner but can be more confusing
// pairs with code from server.js file
const handleImage = (db) => (req, res) => {
  const { id } = req.body;
  
  db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0])
    })
    .catch(err => res.status(400).json('Unable to get entries'))
}

module.exports = { 
  handleImage
  // handleApiCall 
}