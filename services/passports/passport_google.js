const googleCredentials = require('../../config/googleCredentialsLocal.json');
const appConfig = require("../../config/app_config");
const axios = require("axios");
const {BACKEND_URL, BACKEND_CONF, ALLOWED_G_DOMAIN, TRANSLATION_LANG} = require("../../config/app_config");
const googleStrategy = require('passport-google-oauth20').Strategy;
const {GOOGLE_PROVIDER, STUDENT_ROLE, HTTP_STATUS} = require('../../config/constants');
const axiosInstance = require("axios");
const {translate} = require('./../../common/utils');

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
            if (checkResp.status === HTTP_STATUS.OK) {
                axios.get(`${BACKEND_CONF.BASE_URL}/api/user/${user.email}`, {
                    headers: {
                        'Authorization': `Bearer ${BACKEND_CONF.ADMIN_TOKEN}`
                    }
                }).then(userByEmailResp => {
                    const userByEmail = userByEmailResp.data.data;
                    if (userByEmail.accessToken) axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${userByEmail.accessToken}`;
                    if (userByEmailResp.status === HTTP_STATUS.OK) return done(null, userByEmail);
                }).catch(async (ex) => {
                    const errorData = ex.response ? ex.response.data : {message: ex.message};
                    const text = await translate(errorData.message, TRANSLATION_LANG);
                    errorData.message = text ? text : errorData.message;
                    return done(null, false, {message: errorData.message});
                });
            } else return done(null, false, checkResp.data.data.message);
        }).catch(ex => {
            if (ex.response && ex.response.status === HTTP_STATUS.NOT_FOUND) {
                axios.post(`${BACKEND_URL}/api/auth/register-web`, user).then(registerResp => {
                    if (registerResp.data.data.accessToken) axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${registerResp.data.data.accessToken}`;
                    if (registerResp.status === HTTP_STATUS.OK) return done(null, registerResp.data.data.email ? registerResp.data.data : user);
                    else return done(null, false, {message: registerResp.data.data.message});
                }).catch(exr => {
                    return done(null, false, {message: exr.response.data.message || exr.message || exr.toString()});
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