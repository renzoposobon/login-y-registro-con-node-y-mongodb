const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const app = express()
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
require('dotenv').config();
const User = require('./public/user')
const http = require("http");
const server = http.createServer(app)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended:false }))

app.use(express.static(path.join(__dirname, 'public')))

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(db => console.log("MongoDB database connection established successfully"))
  .catch(err => console.log(err))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body
  const user = new User({username, password})
  user.save()
  .then(() => {
    res.status(200).send("USUARIO REGISTRADO")
  })
  .catch((error) => {
    res.status(500).send("ERROR AL REGISTRAR AL USUARIO")
    console.log(error);
  });
})

app.post('/authenticate', (req, res) => {
  const { username, password } = req.body
  User.findOne({username})
  .then((user) => {
    if(!user) {
      res.status(500).send("EL USUARIO NO EXISTE")
    } else {
      user.isCorrectPassword(password, (err, result) => {
        if (err) {
          res.status(500).send("ERROR AL AUTENTICAR AL USUARIO")
        } else if (result === true) {
          res.status(200).send("USUARIO AUTENTICADO CORRECTAMENTE")
        } else {
          res.status(500).send("USUARIO Y/O CONTRASEÑA INCORRECTA")
        }
      })
    }
  })
  .catch((err) => {
    res.status(500).send("ERROR AL AUTENTICAR AL USUARIO")
  });
})

app.set('port', process.env.PORT || 3000)

server.listen(app.get('port'), () => {
  console.log(`Server on http://localhost:${app.get('port')}`);
})

module.exports = app