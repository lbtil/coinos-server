const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const passport = require('./passport')
const cache = require('./cache')
const dotenv = require('dotenv')
dotenv.config()

app = express()
app.enable('trust proxy')
app.use(require('./blockcypher'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(passport.initialize())

const users = require("./routes/users")
const transactions = require("./routes/transactions")

app.get('/users.json', users.index)
app.post("/login", users.login)
app.post('/users', users.create)
app.get('/verify/:token', users.verify)
app.post('/:user', users.update)
app.get('/:user/transactions.json', transactions.json)
app.post('/:user/transactions', transactions.create)
app.post('/transactions/:txid', transactions.update)
app["delete"]('/:user/transactions/:txid', transactions["delete"])
app.get('/:user.json', users.json)
app.get("/secret", passport.authenticate('jwt', { session: false }), users.secret)

const rates = require('./routes/rates')
rates.fetchRates()
app.get('/rates', cache, rates.index)
app.get('/ticker', cache, rates.ticker)

app.use(function(err, req, res, next) {
  res.status(500)
  res.send('An error occurred')
  console.error(err.stack)
  return res.end()
})

app.listen(3000)
