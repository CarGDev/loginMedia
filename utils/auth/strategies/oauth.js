const passport = require('passport')
const axios = require('axios')
const { OAuth2Strategy } = require('passport-oauth')
const boom = require('@hapi/boom')

const config = require('../../../config/config')

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'
const GOOGLE_URSERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

const oAuth2Strategy = new OAuth2Strategy({
  authorizationURL: GOOGLE_AUTHORIZATION_URL,
  tokenURL: GOOGLE_TOKEN_URL,
  clientID: config.googleClientId,
  clientSecret: config.googleClientSecret,
  callbackURL: '/auth/google-oauth/callback'
  }, async (accesToken, refreshToken, profile, cb) => {
    const { data, status } = await axios({
      url: `${config.apiUrl}/user/social-media`,
      method: 'post',
      data: {
        name: profile.name,
        email: profile.email,
        pictures: 'http://dummyimage.com/248x122.jpg/5fa2dd/ffffff',
        type_user_id: 1,
        password: `${profile.id}1wAasasfS!`,
        apiKeyToken: config.apiKeyToken
      }
    })

    if (!data || status !== 201 ) return cb(boom.unauthorized(), false)
    console.log('data', data)
    return cb(null, data)
  }
)

oAuth2Strategy.userProfile = function (accesToken, done) {
  this._oauth2.get(GOOGLE_URSERINFO_URL, accesToken, (err, body) => {
    if (err) return done(err)

    try {
      const { sub, name, email } = JSON.parse(body)

      const profile = {
        id: sub,
        name,
        email
      }

      done(null, profile)
    } catch (error) {
      return done(parseError)
    }
  })
}

passport.use('google-oauth', oAuth2Strategy)
