const {axiosInstance, BACKEND_CONF, TRANSLATION_LANG} = require("../../config/app_config");
const {HTTP_STATUS} = require("../../config/constants");
const serviceUtils = require("../service_utils.service");

const assignPointsToStudent = async (championPointsRequest) => {
    let error, isAssigned;
    await axiosInstance.post(`${BACKEND_CONF.BASE_URL}/api/student/champion-points`, championPointsRequest).then(assignResp => {
        if (assignResp.status === HTTP_STATUS.OK) isAssigned = true;
    }).catch(async (ex) => {
        error = await serviceUtils.getErrorDataFromExceptionOrResponse(ex);
    });
    return {error, isAssigned};
};

const getTotalChampionPoints = async () => {
    let error, championPointsSum;
    await axiosInstance.get(`${BACKEND_CONF.BASE_URL}/api/champion-points/sum`).then(sumResp => {
        if (sumResp.status === HTTP_STATUS.OK) championPointsSum = sumResp.data.data;
    }).catch(async ex => {
        error = await serviceUtils.getErrorDataFromExceptionOrResponse(ex);
    });
    return {error, championPointsSum};
};

module.exports = {
    assignPointsToStudent: assignPointsToStudent,
    getTotalChampionPoints: getTotalChampionPoints
};