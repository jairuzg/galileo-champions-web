const googleCredentials = require('../../config/googleCredentialsLocal.json');
const appConfig = require("../../config/app_config");
const axios = require("axios");
const {BACKEND_URL, BACKEND_CONF, ALLOWED_G_DOMAIN} = require("../../config/app_config");
const googleStrategy = require('passport-google-oauth20').Strategy;
const {GOOGLE_PROVIDER, STUDENT_ROLE, HTTP_STATUS} = require('../../config/constants');

module.exports = (passport) => {
    passport.use(new googleStrategy({
        clientID: googleCredentials.web.client_id,
        clientSecret: googleCredentials.web.client_secret,
        callbackURL: `${appConfig.HOST_URL}/login/google/callback`,
        passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
        const googleProfile = profile._json;
        const user = {
            email: googleProfile.email,
            firstname: googleProfile['given_name'],
            lastname: googleProfile['family_name'],
            isVerified: true,
            googleId: profile.id,
            provider: GOOGLE_PROVIDER,
            role: STUDENT_ROLE
        }
        if (googleProfile.hd !== ALLOWED_G_DOMAIN) {
            const wrongDomainError = new Error(`Solo puedes ingresar con tu correo @${ALLOWED_G_DOMAIN}`);
            wrongDomainError.code = HTTP_STATUS.UNAUTHORIZED;
            return done(null, false, {message: `Solo puedes ingresar con tu correo @${ALLOWED_G_DOMAIN}`});
        }
        axios.post(`${BACKEND_CONF.BASE_URL}/api/user-exists`, {email: user.email}, {
            headers: {
                'X-GC-API-KEY': BACKEND_CONF.API_KEY
            }
        }).then(checkResp => {
            if (checkResp.status === HTTP_STATUS.OK) return done(null, user);
            else return done(null, false, checkResp.data.data.message);
        }).catch(ex => {
            if (ex.response && ex.response.status === HTTP_STATUS.NOT_FOUND) {
                axios.post(`${BACKEND_URL}/api/auth/register`, user).then(registerResp => {
                    if (registerResp.status === HTTP_STATUS.OK) return done(null, user, {otto: 'QUEPEDO'});
                    else return done(null, false, {message: registerResp.data.data.message});
                }).catch(exr => {
                    return (null, false, {message: exr.response.data.message || exr.message || exr.toString()});
                });
            } else return done(null, false, {message: ex.response ? ex.response.data.message : ex.message || ex.toString()})
        });
    }));

    passport.serializeUser((user, done) => {
        const serializedUser = JSON.stringify({
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role
        });
        done(null, serializedUser);
    });

    passport.deserializeUser((user, done) => {
        const deserializedUser = JSON.parse(user)
        done(null, deserializedUser);
    });
}