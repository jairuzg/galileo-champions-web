const axios = require("axios");
const {BACKEND_CONF, TRANSLATION_LANG, JWT_SECRET_KEY, axiosInstance} = require("../../config/app_config");
const {HTTP_STATUS} = require("../../config/constants");
const {translate} = require('./../../common/utils');
const jwt = require("jsonwebtoken");

const confirmAccount = async (token) => {
    let err, isAccountValidated;
    await axios.get(`${BACKEND_CONF.BASE_URL}/api/auth/confirm-account/${token}`).then(confirmResp => {
        if (confirmResp.status === HTTP_STATUS.OK) {
            isAccountValidated = true;
        }
    }).catch(ex => {
        err = ex.response.data;
    });
    return {err, isAccountValidated};
};

const registerStudent = async (user) => {
    let error, registeredUser;
    await axios.post(`${BACKEND_CONF.BASE_URL}/api/auth/register-web`, user).then(registerResp => {
        if (registerResp.status === HTTP_STATUS.OK) {
            registeredUser = registerResp.data.data;
        }
    }).catch(ex => {
        error = ex.response.data;
    });
    return {error, registeredUser};
};

const submitResetPasswordRequest = async (email) => {
    let error, emailSubmitted;
    await axios.post(`${BACKEND_CONF.BASE_URL}/api/auth/reset-password-link`, {email: email}).then(resetPassResp => {
        if (resetPassResp.status === HTTP_STATUS.OK) {
            emailSubmitted = true;
        }
    }).catch(async (ex) => {
        let exData = ex.response.data;
        const text = await translate(exData.message, TRANSLATION_LANG);
        exData.message = text ? text : exData.message;
        error = exData;
    });
    return {error, emailSubmitted};
};

const askTokenValidity = async (token) => {
    let error, isTokenValid;
    await axios.get(`${BACKEND_CONF.BASE_URL}/api/auth/validate-reset-token/${token}`).then(validationResp => {
        if (validationResp.status === HTTP_STATUS.OK) {
            isTokenValid = true;
        }
    }).catch(async (ex) => {
        const exData = ex.response.data;
        const text = await translate(exData.message, TRANSLATION_LANG);
        exData.message = text ? text : exData.message;
        error = exData;
    });
    return {error, isTokenValid};
}

const resetPasswordByToken = async (password, token) => {
    let error, isPasswordReset;
    await axios.post(`${BACKEND_CONF.BASE_URL}/api/auth/reset-password`, {password, token}).then(resetResp => {
        if (resetResp.status === HTTP_STATUS.OK) {
            isPasswordReset = true;
        }
    }).catch(async (ex) => {
        const exData = ex.response.data;
        const text = await translate(exData.message, TRANSLATION_LANG);
        exData.message = text ? text : exData.message;
        error = exData;
    });
    return {error, isPasswordReset};
}

const checkRequiredPermissions = (requiredPermissions) => {
    return (req, res, next) => {
        if (req.isAuthenticated) {
            const role = req.user.role;
            const hasPermissions = requiredPermissions.includes(role);

            if (!hasPermissions) {
                return res.render('auth/page-403');
            } else {
                return next();
            }
        }
        next();
    };
};

const changeUserPassword = async (email, password) => {
    let error, isPasswordChanged;
    await axiosInstance.post(`${BACKEND_CONF.BASE_URL}/api/auth/change-password`, {email,password}).then(changeResp => {
        if(changeResp.status === HTTP_STATUS.OK) isPasswordChanged = true;
    }).catch(async ex => {
        const exData = ex.response.data;
        const text = await translate(exData.message, TRANSLATION_LANG);
        exData.message = text ? text : exData.message;
        error = exData;
    });
    return {error, isPasswordChanged};
}

module.exports = {
    confirmAccount: confirmAccount,
    registerStudent: registerStudent,
    submitResetPasswordRequest: submitResetPasswordRequest,
    askTokenValidity: askTokenValidity,
    resetPasswordByToken: resetPasswordByToken,
    checkRequiredPermissions: checkRequiredPermissions,
    changeUserPassword: changeUserPassword
};