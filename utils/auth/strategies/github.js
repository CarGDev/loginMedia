const passport = require('passport')
const axios = require('axios')
const { get } = require('lodash')
const boom = require('@hapi/boom')

const { Strategy: GitHubStrategy } = require('passport-github')

const config = require('../../../config/config')

passport.use(
    new GitHubStrategy({
    clientID: config.githubClientId,
    clientSecret: config.githubClientSecret,
    callbackURL: '/auth/github/callback',
    includeEmail: true
  }, async (accessToken, refreshToken, profile, cb) => {  
        const { data, status } = await axios({
            url: `${config.apiUrl}/user`,
            method: "post",
            data: {
                nickname: profile.displayName,
                birthday: '1900/01/01',
                status: true,
                platform: 'xbox',
                email: get(profile, 'emails.0.value', `${profile.username}@github.com`),
                phone: '0000000000',
                rol: 'usuario',
                password: profile.id,
                apiKeyToken: config.apiKeyToken
            }
        })

        if (!data || status !== 201 ) return cb(boom.unauthorized(), false)

        return cb(null, data)
    })
)