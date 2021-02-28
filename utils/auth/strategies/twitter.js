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
      url: `${config.apiUrl}/user/social-media`,
      method: 'post',
      data: {
        name: profile.username,
        email: get(profile, 'emails.0.value', `${profile.username}@twitter.com`),
        pictures: 'http://dummyimage.com/248x122.jpg/5fa2dd/ffffff',
        type_user_id: 1,
        password: `${profile.id}1wAasasfS!`,
        apiKeyToken: config.apiKeyToken
      }
    })

    if (!data || status !== 201 ) return cb(boom.unauthorized(), false)

    return cb(null, data)
  })
)
