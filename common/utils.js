const translate = require('translate');
const {GOOGLE_PROVIDER} = require("../config/constants");
const {TRANSLATION_LANG} = require("../config/app_config");

translate.engine = GOOGLE_PROVIDER;

const translateEVErrorMessages = (errors) => {
    const messages = [];
    errors.map(err => {
        let transIntentText = err.msg;
        translate(err.msg, TRANSLATION_LANG).then(text => {
            transIntentText = text;
        }).catch().finally(() => {
            messages.push(transIntentText);
        })
    })
    return messages;
};

const parseStateVariables = (unparsedString) => {
    const varPairs = unparsedString.split(',');
    let convertedObject = {};
    varPairs.forEach(varPair => {
        let varPairArray = varPair.split(':');
        convertedObject[varPairArray[0]] = varPairArray[1];
    });
    console.log('the var pairs ', convertedObject);
    return convertedObject;
};

const object2KeyValueString = (obj) => {
    return JSON.stringify(obj).replace(/[\"|\'|\{|\}]/g, "");
}
module.exports = {
    translate: translate,
    translateEVErrorMessages: translateEVErrorMessages,
    parseStateVariables: parseStateVariables,
    object2KeyValueString: object2KeyValueString
}