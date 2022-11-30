const express = require('express');
const {isAuth} = require("./helpers.controller");
const {checkRequiredPermissions} = require("../services/auth/auth.service");
const {STUDENT_ROLE, LECTURER_ROLE} = require("../config/constants");
const championPointsService = require("../services/champion_points/champion_points.service");
const {param, validationResult} = require("express-validator");
const rockstarService = require("../services/rockstar/galileo_rockstar.service");
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

studentRouter.get("/student/champion-points", isAuth, checkRequiredPermissions([STUDENT_ROLE]), (req, res) => {
    const responseOptions = {
        user: req.user
    };
    championPointsService.getStudentChampionPoints().then(sumResp => {
        if (sumResp.error) {
            responseOptions.errors = [sumResp.error];
        } else {
            responseOptions.championPoints = sumResp.championPoints;
        }
    }).finally(() => {
        if (!responseOptions.championPoints || !responseOptions.championPoints.length) return res.redirect("/student");
        return res.render("student/champion_points/student_champion_points", responseOptions);
    });
});

studentRouter.get("/student/champion-points/:id",
    param("id").isNumeric().withMessage("No encontramos el ID del detalle que quieres ver"),
    isAuth, checkRequiredPermissions([STUDENT_ROLE]), (req, res) => {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            req.flash("errors", validation.errors);
            return res.redirect("/student/champion-points")
        } else {
            const responseOptions = {
                user: req.user
            };
            championPointsService.getStudentChampionPointsDetailsById(req.params["id"]).then(detailsResp => {
                if (detailsResp.error) {
                    responseOptions.errors = [detailsResp.error];
                } else {
                    responseOptions.championPoint = detailsResp.championPoint;
                }
            }).finally(() => {
                if (!responseOptions.championPoint) return res.redirect("/student/champion-points");
                return res.render("student/champion_points/student_champion_point_detail", responseOptions);
            });
        }
    }
);

studentRouter.get("/student/rockstar-summary", isAuth, checkRequiredPermissions([STUDENT_ROLE]),
    (req, res) => {
        rockstarService.getStudentRockstarInfo().then(rockstarResp => {
            const responseOptions = {
                user: req.user
            };
            if (rockstarResp.error) {
                responseOptions.errors = rockstarResp.error.message;
            }
            return res.render("student/rockstar/student_rockstar_summary", responseOptions);
        });
    });

studentRouter.get("/student/profile", isAuth, checkRequiredPermissions([STUDENT_ROLE]),
    (req, res, next) => {
        return res.render("student/user_profile", {user: req.user, csrfToken: req.csrfToken()});
    });

module.exports = {
    studentRouter: studentRouter
};