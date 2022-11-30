const {axiosInstance, BACKEND_CONF, TRANSLATION_LANG} = require("../../config/app_config");
const appUtils = require("../../common/utils");
const {HTTP_STATUS} = require("../../config/constants");
const {getLecturerRedemptionCentersFromServer} = require("../redemption_center/redemption_center.service");
const serviceUtils = require("../service_utils.service");

const getRockstarSummary = async () => {
    let error, rockstarChampions;
    const localRockstarChampions = appUtils.getLocalstorage("rockstarChampions");
    if (!localRockstarChampions) {
        const summaryResp = await getRockstarSummaryFromServer();
        if (summaryResp.error) error = summaryResp.error;
        else rockstarChampions = summaryResp.rockstarChampions;
    } else rockstarChampions = localRockstarChampions;
    return {error, rockstarChampions};
};

const getRockstarSummaryFromServer = async () => {
    let error, rockstarChampions;
    await axiosInstance.get(`${BACKEND_CONF.BASE_URL}/api/rockstar/winners-summary`).then(summaryResp => {
        if (summaryResp.status === HTTP_STATUS.OK) {
            appUtils.setLocalstorage("rockstarChampions", summaryResp.data.data)
            rockstarChampions = summaryResp.data.data;
        }
    }).catch(async ex => {
        const errorData = ex.response ? ex.response.data : {message: ex.message};
        const text = await appUtils.translate(errorData.message, TRANSLATION_LANG);
        errorData.message = text ? text : errorData.message;
        error = errorData;
    });
    return {error, rockstarChampions};
};

const transferRockstarPrizeToRedemptionCenter = async (championPointsRequest) => {
    let error, isTransferred;
    await axiosInstance.post(`${BACKEND_CONF.BASE_URL}/api/rockstar/transfer-points`, championPointsRequest).then(async (transferResp) => {
        if (transferResp.status === HTTP_STATUS.OK) {
            const summaryResp = await getRockstarSummaryFromServer()
            if (summaryResp.error) error = summaryResp.error;
            isTransferred = true;
        }
    });
    return {error, isTransferred};
};

const getStudentRockstarInfo = async () => {
    let error, isStudentRockstar;
    await axiosInstance.get(`${BACKEND_CONF.BASE_URL}/api/rockstar/student/rockstar-info`).then(rockstarResp => {
        if (rockstarResp === HTTP_STATUS.OK) isStudentRockstar = true;
    }).catch(async ex => {
        error = serviceUtils.getErrorDataFromExceptionOrResponse(ex);
    });
    return {error, isStudentRockstar};
};

module.exports = {
    getRockstarSummary: getRockstarSummary,
    transferRockstarPrizeToRedemptionCenter: transferRockstarPrizeToRedemptionCenter,
    getStudentRockstarInfo: getStudentRockstarInfo
};