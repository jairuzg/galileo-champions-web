const {BACKEND_URL, TRANSLATION_LANG} = require("../../config/app_config");
const axios = require("axios");
const {HTTP_STATUS} = require("../../config/constants");
const localStrategy = require('passport-local').Strategy;
const {translate} = require('./../../common/utils');

module.exports = (passport) => {
    passport.use(new localStrategy({usernameField: 'email'}, (email, password, done) => {
        const payload = {
            email: email,
            password: password
        }
        axios.post(`${BACKEND_URL}/api/auth/login-web`, payload).then(loginResp => {
            if (loginResp.status === HTTP_STATUS.OK) {
                let user = loginResp.data.data;
                delete user.password;
                return done(null, user);
            }
        }).catch(err => {
            let errorMessage = err.response.data.message;
            translate(err.response.data.message, TRANSLATION_LANG).then(text => {
                console.log("tradujo un error",text);
                errorMessage = text;
            }).catch(e => {
                console.log("Error al intentar traducir ", e);
            }).finally(() => {
                return done(null, false, {message: errorMessage});
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