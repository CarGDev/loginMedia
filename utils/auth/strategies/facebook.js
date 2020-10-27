const passport = require('passport')
const axios = require('axios')
const boom = require('@hapi/boom')

const { Strategy: FacebookStrategy } = require('passport-facebook')

const config = require('../../../config/config')

passport.use(
    new FacebookStrategy({
    clientID: config.facebookAppId,
    clientSecret: config.facebookAppSecret,
    callbackURL: "auth/facebook/callback",
    profile: ['id', 'displayName', 'photos', 'email']
  }, async (accessToken, refreshToken, profile, cb) => {    
        const { data, status } = await axios({
            url: `${config.apiUrl}/user/`,
            method: "post",
            data: {
                nickname: profile.displayName,
                country: 'CO',
                postal_code: '00000',
                birthday: '1900/01/01',
                status: true,
                avatar: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.facebook.',
                platform: 'xbox',
                email: profile.email,
                phone: '0000000000',
                rol: 'usuario',
                level: '1',
                password: profile.id,
                apiKeyToken: config.apiKeyToken
            }
        });

        if (!data || status !== 200) return cb(boom.unauthorized(), false)

        return cb(null, data)
    })
)