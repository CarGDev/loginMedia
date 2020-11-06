'use strict'

const express = require("express")
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
require('./utils/auth/strategies/basic')
require('./utils/auth/strategies/oauth')
require('./utils/auth/strategies/twitter')
require('./utils/auth/strategies/github')
require('./utils/auth/strategies/facebook')

const postSignIn = async (req, res, next) => {
  const { rememberMe } = req.body
  passport.authenticate('basic', (error, data) => {
    try {
      if (error || !data) next(boom.unauthorized())
      req.login(data, { session: false }, async (error) => {
        if (error) next(error)
        let user = data.body.user
        user.token = data.body.token
        /*const { token, ...user } = data.body */
        res.cookie('token', user.token, {
          httpOnly: !config.dev,
          secure: !config.dev,
          maxAge: rememberMe ? THIRTY_DAYS_IN_SEC : TWO_HOURS_IN_SEC
        })


        res.status(200).json(user)
      })
    } catch (error) {
      next(error)
    }
  })(req, res, next)
}

const postSignUp = async (req, res, next) => {
  const { body: user } = req
  try {
    await axios({
      url: `${config.apiUrl}/user`,
      method: 'post',
      data: user
    })
    res.status(201).json({ message: 'User created' })
  } catch (error) {
    next(error)
  }
}

const googleOAuth = async (req, res, next) => {
  if (!req.user) next(boom.unauthorized())
  
  const token = req.user.body.token
  const username = req.user.body.Nickname
  const email = req.user.body.contactId.email
  const id = req.user.body.id

  res.cookie('token', token)
  res.cookie('email', email)
  res.cookie('user', username)
  res.cookie('id', id)
  // const query = querystring.stringify({
  //   "user": username,
  //   "id": id,
  //   "token": token,
  //   "email": email,
  //   "valid": true
  // })
  // res.redirect('/?' + query)
  res.status(200).send({
    error: false,
    status: 200,
    body: {
      'user': username,
      'id': id,
      'token': token,
      'email': email,
      'valid': true
    }
  })
  //res.redirect(`${config.apiUrlBack}/${username}&&${id}&&${email}&&${token}`)
}

const twitterOAuth = async (req, res, next) => {
  if (!req.user) next(boom.unauthorized())

  const token = req.user.body.token
  const username = req.user.body.Nickname
  const email = req.user.body.contactId.email
  const id = req.user.body.id

  res.cookie('token', token, { domain: 'http://blood-stream.xyz/#/', path: '/' })
  res.cookie('email', email)
  res.cookie('user', username)
  res.cookie('id', id)
  // const query = querystring.stringify({
  //   "user": username,
  //   "id": id,
  //   "token": token,
  //   "email": email,
  //   "valid": true
  // })
  // res.redirect('/?' + query)
  res.status(200).send({
    error: false,
    status: 200,
    body: {
      'user': username,
      'id': id,
      'token': token,
      'email': email,
      'valid': true
    }
  })
  //res.redirect(`${config.apiUrlBack}/${username}&&${id}&&${email}&&${token}`)
}

const githubAuth = async (req, res, next) => {
  if (!req.user) next(boom.unauthorized())

  const token = req.user.body.token
  const username = req.user.body.Nickname
  const email = req.user.body.contactId.email
  const id = req.user.body.id

  res.cookie('token', token)
  res.cookie('email', email)
  res.cookie('user', username)
  res.cookie('id', id)
  // const query = querystring.stringify({
  //   "user": username,
  //   "id": id,
  //   "token": token,
  //   "email": email,
  //   "valid": true
  // })
  // res.redirect('/?' + query)
  res.status(200).send({
    error: false,
    status: 200,
    body: {
      'user': username,
      'id': id,
      'token': token,
      'email': email,
      'valid': true
    }
  })
  //res.redirect(`${config.apiUrlBack}/${username}&&${id}&&${email}&&${token}`)
}

const facebookAuth = async (req, res, next) => {
  if (!req.user) next(boom.unauthorized())

  const token = req.user.body.token
  const username = req.user.body.Nickname
  const email = req.user.body.contactId.email
  const id = req.user.body.id

  res.cookie('token', token)
  res.cookie('email', email)
  res.cookie('user', username)
  res.cookie('id', id)
  // const query = querystring.stringify({
  //   "user": username,
  //   "id": id,
  //   "token": token,
  //   "email": email,
  //   "valid": true
  // })
  // res.redirect('/?' + query)
  res.status(200).send({
    error: false,
    status: 200,
    body: {
      'user': username,
      'id': id,
      'token': token,
      'email': email,
      'valid': true
    }
  })
  //res.redirect(`${config.apiUrlBack}/${username}&&${id}&&${email}&&${token}`)
}

const mainPage = async (req, res, next) => {
  res.send('Working')
}
app.post("/auth/sign-in", postSignIn)
app.post("/auth/sign-up", postSignUp)
app.get('/auth/google-oauth', passport.authenticate('google-oauth', { scope: ['email', 'profile', 'openid'] }))
app.get('/auth/google-oaut/callback', passport.authenticate('google-oauth', { session: false }), googleOAuth)
app.get('/auth/twitter', passport.authenticate('twitter', {scope:['include_email=true']}))
app.get('/home', passport.authenticate('twitter', { session: false }), twitterOAuth)
app.get('/auth/github', passport.authenticate('github'))
app.get('/auth/github/callback', passport.authenticate('github', { session: false }), githubAuth)
app.get('/auth/facebook', passport.authenticate('facebook'))
app.get('/auth/facebook/callback', passport.authenticate('facebook', { session: false }), facebookAuth)
app.get('/', mainPage)
app.listen(config.port, function() {
  console.log(`Listening http://localhost:${config.port}`)
})
