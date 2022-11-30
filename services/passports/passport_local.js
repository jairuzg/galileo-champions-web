const {BACKEND_URL, TRANSLATION_LANG, BACKEND_CONF, JWT_SECRET_KEY} = require("../../config/app_config");
const axios = require("axios");
const {HTTP_STATUS} = require("../../config/constants");
const localStrategy = require('passport-local').Strategy;
const {translate} = require('./../../common/utils');
const jwt = require('jsonwebtoken');
const axiosInstance = require("axios");
const appUtils = require("../../common/utils");

module.exports = (passport) => {
    passport.use(new localStrategy({usernameField: 'email'}, (email, password, done) => {
        appUtils.localStorage.clear();
        appUtils.localStorage.set("passportId", email);
        const payload = {
            username: email,
            password: password,
            client_id: BACKEND_CONF.CLIENT_ID,
            client_secret: BACKEND_CONF.CLIENT_SECRET,
            grant_type: 'password'
        };
        axios.post(`${BACKEND_URL}/api/auth/login`, payload).then(loginResp => {
            if (loginResp.status === HTTP_STATUS.OK) {
                let authorization = loginResp.data;
                const accessToken = authorization['access_token'];
                const user = jwt.verify(accessToken, JWT_SECRET_KEY);
                delete user.password;
                user.accessToken = accessToken;
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                return done(null, user);
            }
        }).catch(err => {
            const errorData = err.response ? err.response.data : {
                message: err.message,
                code: HTTP_STATUS.INTERNAL_SERVER_ERROR
            };
            translate(errorData.message, TRANSLATION_LANG).then(text => {
                errorData.message = text;
            }).catch(e => {
                console.error("Error al intentar traducir ", e);
            }).finally(() => {
                return done(null, false, errorData);
            });
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
};