const translate = require('translate');
const {GOOGLE_PROVIDER} = require("../config/constants");
const {TRANSLATION_LANG, PASSPORT_ID} = require("../config/app_config");
const localStorage = require('local-storage');

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
    return convertedObject;
};

const object2KeyValueString = (obj) => {
    return JSON.stringify(obj).replace(/[\"|\'|\{|\}]/g, "");
}

const setLocalstorage = (key, value) => {
    const passportId = localStorage.get("passportId");
    return localStorage.set(key + passportId, value);
};

const getLocalstorage = (key) => {
    const passportId = localStorage.get("passportId");
    return localStorage.get(key + passportId);
};

module.exports = {
    translate: translate,
    translateEVErrorMessages: translateEVErrorMessages,
    parseStateVariables: parseStateVariables,
    object2KeyValueString: object2KeyValueString,
    setLocalstorage: setLocalstorage,
    getLocalstorage: getLocalstorage,
    localStorage, localStorage
}