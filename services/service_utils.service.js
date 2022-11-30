const appUtils = require("../common/utils");
const {TRANSLATION_LANG} = require("../config/app_config");

const getErrorDataFromExceptionOrResponse = async (ex) => {
    console.error(ex.message);
    const errorData = ex.response ? ex.response.data : {message: ex.message};
    const text = await appUtils.translate(errorData.message, TRANSLATION_LANG);
    errorData.message = text ? text : errorData.message;
    return errorData;
};

module.exports = {
    getErrorDataFromExceptionOrResponse: getErrorDataFromExceptionOrResponse
};