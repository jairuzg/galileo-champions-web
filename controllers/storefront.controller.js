const express = require('express');
const storefrontRouter = express.Router();
const {isAuth} = require("./helpers.controller");

storefrontRouter.get('/', function (req, res) {
    res.render('storefront/index');
});

storefrontRouter.get('/test', (req, res) => {
    res.json({});
})

module.exports = {
    storefrontRouter: storefrontRouter
};