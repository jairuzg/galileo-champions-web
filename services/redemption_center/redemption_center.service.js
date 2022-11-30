const {axiosInstance, BACKEND_CONF, TRANSLATION_LANG} = require("../../config/app_config");
const {HTTP_STATUS} = require("../../config/constants");
const appUtils = require("../../common/utils");

const getLecturerRedemptionCenters = async () => {
    let error, redemptionCenters;
    const localRedemptionCenters = appUtils.getLocalstorage("redemptionCenters");
    if (!localRedemptionCenters) {
        const rcResp = await getLecturerRedemptionCentersFromServer();
        if (rcResp.error) error = rcResp.error;
        else redemptionCenters = rcResp.redemptionCenters;
    } else redemptionCenters = localRedemptionCenters;
    return {error, redemptionCenters};
};

const getLecturerRedemptionCentersFromServer = async () => {
    let error, redemptionCenters;
    await axiosInstance.get(`${BACKEND_CONF.BASE_URL}/api/lecturer/redemption-centers`).then(rcResp => {
        if (rcResp.status === HTTP_STATUS.OK) {
            appUtils.setLocalstorage("redemptionCenters", rcResp.data.data);
            redemptionCenters = rcResp.data.data;
        }
    }).catch(async (ex) => {
        const errorData = ex.response ? ex.response.data : {message: ex.message};
        const text = await appUtils.translate(errorData.message, TRANSLATION_LANG);
        errorData.message = text ? text : errorData.message;
        error = errorData;
    });
    return {error, redemptionCenters};
};

module.exports = {
    getLecturerRedemptionCenters: getLecturerRedemptionCenters,
    getLecturerRedemptionCentersFromServer: getLecturerRedemptionCentersFromServer
};