const express = require('express');
const storefrontRouter = express.Router();
const {isAuth} = require("./helpers.controller");
const {checkRequiredPermissions} = require("../services/auth/auth.service");
const {ADMIN_ROLE, LECTURER_ROLE, STUDENT_ROLE} = require("../config/constants");

storefrontRouter.get('/', isAuth, checkRequiredPermissions([ADMIN_ROLE, LECTURER_ROLE, STUDENT_ROLE]), function (req, res) {
    if (req.user.role === LECTURER_ROLE) return res.redirect('/lecturer');
    if (req.user.role === STUDENT_ROLE) return res.redirect('/rockstar-form');
    res.render('storefront/index');
});

module.exports = {
    storefrontRouter: storefrontRouter
};