const express = require('express');
const {BACKEND_CONF} = require("../config/app_config");
const rockstarRouter = express.Router();

rockstarRouter.get('/rockstar-form', (req, res, next) => {
    const args = {
        backendUrl: BACKEND_CONF.BASE_URL
    }
    console.log("EN EL ROCKSTAR FORM");
    if (!req.isAuthenticated()) {
        console.log("No esta autenticado");
        res.render('rockstar/rockstar-form-login');
    } else {
        res.render('rockstar/rockstar-form', args);
    }
});

module.exports = {
    rockstarRouter: rockstarRouter
};