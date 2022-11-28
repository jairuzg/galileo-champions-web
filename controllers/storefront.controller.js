const express = require('express');
const storefrontRouter = express.Router();
const {isAuth} = require("./helpers.controller");
const {checkRequiredPermissions} = require("../services/auth/auth.service");
const {ADMIN_ROLE, LECTURER_ROLE} = require("../config/constants");

storefrontRouter.get('/', isAuth, checkRequiredPermissions([ADMIN_ROLE, LECTURER_ROLE]), function (req, res) {
    res.render('storefront/index');
});

module.exports = {
    storefrontRouter: storefrontRouter
};