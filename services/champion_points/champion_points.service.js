const {axiosInstance, BACKEND_CONF, TRANSLATION_LANG} = require("../../config/app_config");
const {HTTP_STATUS} = require("../../config/constants");
const appUtils = require("../../common/utils");

const assignPointsToStudent = async (championPointsRequest) => {
    let error, isAssigned;
    await axiosInstance.post(`${BACKEND_CONF.BASE_URL}/api/student/champion-points`, championPointsRequest).then(assignResp => {
        if (assignResp.status === HTTP_STATUS.OK) isAssigned = true;
    }).catch(async (ex) => {
        console.log("Error while trying to assign points to student: ", ex.message);
        const errorData = ex.response ? ex.response.data : {message: ex.message};
        const text = await appUtils.translate(errorData.message, TRANSLATION_LANG);
        errorData.message = text ? text : errorData.message;
        error = errorData;
    });
    return {error, isAssigned};
};

module.exports = {
    assignPointsToStudent: assignPointsToStudent
};