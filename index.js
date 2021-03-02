'use strict'

const express = require('express')
const helmet = require('helmet')
const passport = require('passport')
const boom = require('@hapi/boom')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const axios = require('axios')
const cors = require('cors')
const querystring = require('querystring')

const config = require("./config/config")

const app = express()

// Agregamos las variables de timpo en segundos
const THIRTY_DAYS_IN_SEC = 2592000
const TWO_HOURS_IN_SEC = 7200

// body parser
const corsOptions = {
  origin: '*',
  credentials: true
}

app.use(cors(corsOptions))  

app.use(express.json())
app.use(cookieParser(config.sessionSecret))
app.use(session({ secret: config.sessionSecret }))
app.use(passport.initialize())
app.use(passport.session())
app.enable('trust proxy')

if (config.dev === 'production') {
  app.use((req, res, next) => {
    if ((!req.secure) && (req.get('X-Forwarded-Proto') !== 'https')) {
    res.redirect(307, 'https://' + req.get('Host') + req.url);
    } else
    next();
  });
}
app.use(helmet())

// Basic Strategy
require('./utils/auth/strategies/oauth')
require('./utils/auth/strategies/twitter')

const googleOAuth = async (req, res, next) => {
  if (!req.user) next(boom.unauthorized())
  res.cookie('token', req.user.access_token)
  res.redirect('http://localhost:8001/registro')
  /* res.status(200).send({
    error: false,
    status: 200,
    body: req.user
  }) */
}

const twitterOAuth = async (req, res, next) => {
  if (!req.user) next(boom.unauthorized())
  res.cookie('token', req.user.access_token)
  res.redirect('http://localhost:8001/registro')
  /* res.status(200).send({
    error: false,
    status: 200,
    body: req.user
  }) */
}


const mainPage = async (req, res, next) => {
  res.send('Working')
}

app.get('/auth/google-oauth', passport.authenticate('google-oauth', { scope: ['email', 'profile', 'openid'] }))
app.get('/auth/google-oauth/callback', passport.authenticate('google-oauth', { session: false }), googleOAuth)
app.get('/auth/twitter', passport.authenticate('twitter', {scope:['include_email=true']}))
app.get('/home', passport.authenticate('twitter', { session: false }), twitterOAuth)
app.get('/', mainPage)

app.listen(config.port, function() {
  console.log(`Listening http://localhost:${config.port}`)
})
