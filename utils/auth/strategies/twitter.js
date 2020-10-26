const passport = require('passport')
const axios = require('axios')
const { get } = require('lodash')
const boom = require('@hapi/boom')

const { Strategy: TwitterStrategy } = require('passport-twitter')

const config = require('../../../config/config')

passport.use(
  new TwitterStrategy({
    consumerKey: config.twitterConsumerKey,
    consumerSecret: config.twitterConsumerSecret,
    callbackURL: '/home',
    includeEmail: true
  }, async (token, tokenSecret, profile, cb) => {
    const { data, status } = await axios({
      url: `${config.apiUrl}/user/`,
      method: 'post',
      data: {
        nickname: profile.displayName,
        country: 'MX',
        postal_code: '00000',
        birthday: '1900/01/01',
        status: true,
        avatar: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.facebook.',
        platform: 'xbox',
        email: get(profile, 'emails.0.value', `${profile.username}@twitter.com`),
        phone: '0000000000',
        rol: 'usuario',
        level: '1',
        password: profile.id,
        apiKeyToken: config.apiKeyToken
      }
    })

    if (!data || status !== 201 ) return cb(boom.unauthorized(), false)

    return cb(null, data)
  })
)
