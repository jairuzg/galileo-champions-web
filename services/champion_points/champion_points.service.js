const {axiosInstance, BACKEND_CONF, TRANSLATION_LANG} = require("../../config/app_config");
const {HTTP_STATUS} = require("../../config/constants");
const serviceUtils = require("../service_utils.service");
const axios = require("axios");

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

const getStudentChampionPoints = async () => {
    let error, championPoints;
    await axiosInstance.get(`${BACKEND_CONF.BASE_URL}/api/champion-points`).then(pointsResp => {
        if (pointsResp.status === HTTP_STATUS.OK) championPoints = pointsResp.data.data;
    }).catch(async ex => {
        error = await serviceUtils.getErrorDataFromExceptionOrResponse(ex);
    });
    return {error, championPoints};
};

const getStudentChampionPointsDetailsById = async (id) => {
    let error, championPoint;
    await axiosInstance.get(`${BACKEND_CONF.BASE_URL}/api/champion-points/${id}`).then(detailsResp => {
        if (detailsResp.status === HTTP_STATUS.OK) championPoint = detailsResp.data.data;
    }).catch(async ex => {
        error = await serviceUtils.getErrorDataFromExceptionOrResponse(ex);
    });
    return {error, championPoint};
};

module.exports = {
    assignPointsToStudent: assignPointsToStudent,
    getTotalChampionPoints: getTotalChampionPoints,
    getStudentChampionPoints: getStudentChampionPoints,
    getStudentChampionPointsDetailsById: getStudentChampionPointsDetailsById
};