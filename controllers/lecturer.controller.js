const express = require("express");
const {isAuth} = require("./helpers.controller");
const {checkRequiredPermissions} = require("../services/auth/auth.service");
const {LECTURER_ROLE, HTTP_STATUS} = require("../config/constants");
const redemptionCenterService = require("../services/redemption_center/redemption_center.service");
const {body, query, validationResult} = require("express-validator");
const {BACKEND_CONF} = require("../config/app_config");
const championPointsService = require("../services/champion_points/champion_points.service");
const rockstarService = require("../services/rockstar/galileo_rockstar.service");
const lecturerRouter = express.Router();

lecturerRouter.get("/lecturer", isAuth, checkRequiredPermissions([LECTURER_ROLE]), (req, res) => {
    redemptionCenterService.getLecturerRedemptionCenters().then(rcResp => {
        const resOptions = {
            user: req.user,
            redemptionCenters: (rcResp.error && rcResp.error.code === HTTP_STATUS.NOT_FOUND) ? [] : rcResp.redemptionCenters
        }
        if (rcResp.redemptionCenters || ((rcResp.error && rcResp.error.code === HTTP_STATUS.NOT_FOUND))) return res.render("lecturer/lecturer_index", resOptions);
        else if (rcResp.error) throw rcResp.error;
    });
});

lecturerRouter.get('/lecturer/champion-points', isAuth, checkRequiredPermissions([LECTURER_ROLE]),
    query("lrc").isString().notEmpty().withMessage("No recibimos para que centro de canje se mando el request"),
    query("redemptionCenter").isString().notEmpty().withMessage("No recibimos el nombre del centro de canje"),
    (req, res, next) => {
        const options = {
            csrfToken: req.csrfToken(),
            lrc: req.query['lrc'],
            redemptionCenter: req.query['redemptionCenter'],
            user: req.user,
            backendUrl: BACKEND_CONF.BASE_URL
        };
        return res.render("lecturer/manage_redemption_center", options);
    }
);

lecturerRouter.post('/lecturer/champion-points', isAuth, checkRequiredPermissions([LECTURER_ROLE]),
    body('student').isEmail().withMessage("El email del estudiante es invalido o no fue recibido"),
    body("lrc").isString().withMessage("No recibimos para que centro de canje se mando el request"),
    body("reason").notEmpty().withMessage("No recibimos la razon por la cual estas asignando los puntos"),
    body("points").isNumeric().withMessage("No recibimos los puntos que estas asignando al estudiante"),
    body("redemptionCenter").notEmpty().withMessage("No recibimos el nombre del centro de canje"),
    (req, res, next) => {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            req.flash("errors", validation.errors);
            return res.redirect(`/lecturer/champion-points?lrc=${req.body.lrc}&redemptionCenter=${req.body.redemptionCenter}`);
        }
        const championPoints = {
            lrc: req.body.lrc,
            student: req.body.student,
            points: parseInt(req.body.points),
            reason: req.body.reason,
        };
        championPointsService.assignPointsToStudent(championPoints).then(assignResp => {
            if (assignResp.error) {
                console.error("Errors found when assigning points ", assignResp.error);
                req.flash("errors", [assignResp.error.message]);
                return res.redirect(`/lecturer/champion-points?lrc=${req.body.lrc}&redemptionCenter=${req.body.redemptionCenter}`);
            } else {
                return res.render("lecturer/champion_points/assignment_success", {user: req.user});
            }
        });
    }
);

lecturerRouter.get("/lecturer/rockstar-summary", isAuth, checkRequiredPermissions([LECTURER_ROLE]),
    (req, res, next) => {
        rockstarService.getRockstarSummary().then(summaryResp => {
            if (summaryResp.error) {
                return res.render("lecturer/rockstar/rockstar_summary", {
                    errors: [summaryResp.error.message],
                    user: req.user,
                    csrfToken: req.csrfToken()
                });
            } else {
                redemptionCenterService.getLecturerRedemptionCenters().then(rcResp => {
                    if (rcResp.error) return res.render("lecturer/rockstar/rockstar_summary", {
                        errors: [rcResp.error.message],
                        user: req.user,
                        csrfToken: req.csrfToken()
                    }); else return res.render("lecturer/rockstar/rockstar_summary", {
                        user: req.user,
                        rockstarChampions: summaryResp.rockstarChampions,
                        redemptionCenters: rcResp.redemptionCenters,
                        csrfToken: req.csrfToken()
                    });
                });
            }
        });
    });

lecturerRouter.post("/lecturer/transfer-rockstar-prize", isAuth, checkRequiredPermissions([LECTURER_ROLE]),
body("lrc").notEmpty().withMessage("No pudimos recibir el centro de canje, vuelve a intentarlo"),
    body("student").isEmail().withMessage("El email del estudiante es invalido o no se encontro"),
    body("rockstarPeriod").isNumeric().withMessage("No pudimos encontrar el periodo de votaciones"),
    (req, res, next) => {
        rockstarService.transferRockstarPrizeToRedemptionCenter(req.body).then(transferResp => {
            if (transferResp.error) {
                req.flash("errors", [transferResp.error.message]);
                return res.redirect("/lecturer/rockstar-summary");
            } else return res.render("lecturer/rockstar/transfer_success", {user: req.user});
        });
    }
)
;

lecturerRouter.get("/lecturer/profile", isAuth, checkRequiredPermissions([LECTURER_ROLE]),
    (req, res, next) => {
        return res.render("lecturer/user_profile", {user: req.user, csrfToken: req.csrfToken()});
    });

module.exports = {lecturerRouter};