const {HTTP_STATUS} = require("../../config/constants");
const {translate} = require('./../../common/utils');
const {TRANSLATION_LANG, BACKEND_CONF, axiosInstance} = require("../../config/app_config");

const getCurrentRockstarPeriod = async () => {
    let error, rockstarPeriod;
    await axiosInstance.get(`${BACKEND_CONF.BASE_URL}/api/current-rockstar-period`).then(periodResp => {
        if (periodResp.status === HTTP_STATUS.OK) rockstarPeriod = periodResp.data.data;
    }).catch(async (ex) => {
        const errorData = ex.response ? ex.response.data : {
            message: ex.message,
            code: HTTP_STATUS.INTERNAL_SERVER_ERROR
        };
        const text = await translate(errorData.message, TRANSLATION_LANG);
        errorData.message = text ? text : errorData.message;
        error = errorData;
    });
    return {error, rockstarPeriod};
};

const saveRockstarFormData = async (rockstarForm) => {
    let error, isFormStored;
    await axiosInstance.post(`${BACKEND_CONF.BASE_URL}/api/rockstar-form`, rockstarForm).then(saveFormResp => {
        if (saveFormResp.status === HTTP_STATUS.OK) {
            isFormStored = true;
        }
    }).catch(async (ex) => {
        const errorData = ex.response ? ex.response.data : {
            message: ex.message,
            code: HTTP_STATUS.INTERNAL_SERVER_ERROR
        };
        const text = await translate(errorData.message, TRANSLATION_LANG);
        errorData.message = text ? text : errorData.message;
        error = errorData;
    });
    return {error, isFormStored};
};

const checkIfUserCanVote = async () => {
    let error, userCanVote;
    try {
        await axiosInstance.get(`${BACKEND_CONF.BASE_URL}/api/rockstar/voter-can-vote`).then(verifyResp => {
            if (verifyResp.status === HTTP_STATUS.OK) userCanVote = true;
        });
    } catch (ex) {
        const errorData = ex.response ? ex.response.data : {message: ex.message};
        const text = await translate(errorData.message, TRANSLATION_LANG);
        errorData.message = text ? text : errorData.message;
        error = errorData;
    }
    return {error, userCanVote};
}

module.exports = {
    getCurrentRockstarPeriod: getCurrentRockstarPeriod,
    saveRockstarFormData: saveRockstarFormData,
    checkIfUserCanVote: checkIfUserCanVote
};