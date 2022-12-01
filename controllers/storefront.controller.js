const express = require('express');
const storefrontRouter = express.Router();
const {LECTURER_ROLE, STUDENT_ROLE} = require("../config/constants");

storefrontRouter.get('/', function (req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.role === LECTURER_ROLE) return res.redirect('/lecturer');
        if (req.user.role === STUDENT_ROLE) return res.redirect('/student');
    }
    return res.redirect("/about");
});

storefrontRouter.get("/privacy", (req, res) => {
    return res.render("storefront/privacy");
});

storefrontRouter.get("/about", (req, res) => {
    return res.render("storefront/about");
});

module.exports = {
    storefrontRouter: storefrontRouter
};