const express = require('express');
const {isAuth} = require("./helpers.controller");
const {checkRequiredPermissions} = require("../services/auth/auth.service");
const {STUDENT_ROLE} = require("../config/constants");
const championPointsService = require("../services/champion_points/champion_points.service");
const studentRouter = express.Router();

studentRouter.get("/student", isAuth, checkRequiredPermissions([STUDENT_ROLE]), (req, res) => {
    const responseOptions = {
        user: req.user
    };
    championPointsService.getTotalChampionPoints().then(sumResp => {
        if (sumResp.error) {
            responseOptions.errors = [sumResp.error];
        } else {
            responseOptions.championPointsSum = sumResp.championPointsSum;
        }
    }).finally(() => {
        return res.render("student/student_index", responseOptions);
    });
});

module.exports = {
    studentRouter: studentRouter
};