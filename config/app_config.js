const env = require('dotenv');
env.config();

const axiosInstance = require('axios');

module.exports = {
    HOST_URL: process.env.HOST_URL,
    BACKEND_URL: process.env.BACKEND_URL,
    BACKEND_CONF: {
        BASE_URL: process.env.BACKEND_URL,
        ADMIN_USERNAME: process.env.BACKEND_ADMIN_USERNAME,
        ADMIN_PASSWD: process.env.BACKEND_ADMIN_PASSWORD,
        ADMIN_TOKEN: process.env.BACKEND_ADMIN_TOKEN,
        CLIENT_ID: process.env.BACKEND_CLIENT_ID,
        CLIENT_SECRET: process.env.BACKEND_CLIENT_SECRET,
        API_KEY: process.env.BACKEND_API_KEY
    },
    ALLOWED_G_DOMAIN: process.env.ALLOWED_G_LOGIN_DOMAIN,
    TRANSLATION_LANG: process.env.TRANSLATION_LANG,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    TOKEN_HEADER_KEY: process.env.TOKEN_HEADER_KEY,
    axiosInstance: axiosInstance,
    PASSPORT_ID: ''
};