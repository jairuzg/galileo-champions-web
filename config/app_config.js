const env = require('dotenv');
env.config();

module.exports = {
    HOST_URL: process.env.HOST_URL,
    BACKEND_URL: process.env.BACKEND_URL,
    BACKEND_CONF: {
        BASE_URL: process.env.BACKEND_URL,
        ADMIN_USERNAME: process.env.BACKEND_ADMIN_USERNAME,
        ADMIN_PASSWD: process.env.BACKEND_ADMIN_PASSWORD,
        CLIENT_ID: process.env.BACKEND_CLIENT_ID,
        CLIENT_SECRET: process.env.BACKEND_CLIENT_SECRET,
        API_KEY: process.env.BACKEND_API_KEY
    },
    ALLOWED_G_DOMAIN: process.env.ALLOWED_G_LOGIN_DOMAIN,
    TRANSLATION_LANG: process.env.TRANSLATION_LANG
};