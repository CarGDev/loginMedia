const passport = require('passport')
const { BasicStrategy } = require('passport-http')

const boom = require('@hapi/boom')
const axios = require('axios')
const config = require('../../../config/config')
const { method } = require('lodash')

passport.use(
  new BasicStrategy( async (user, password, cb) => {
    try {
      const { data, status } = await axios({
        url: `${config.apiUrl}/user/login`,
        method: 'post',
        auth: {
          password,
          username: user
        },
        data: {
          apiKeyToken: config.apiKeyToken
        }
      })
      if (!data || status !== 200) return cb(boom.unauthorized(),false)

      return cb(null, data)

    } catch (error) {
      cb(error)
    }
  })
)