const express = require('express');
const {BACKEND_CONF} = require("../config/app_config");
const rockstarFormService = require("../services/rockstar/rockster_form.service");
const {body, validationResult} = require("express-validator");
const rockstarRouter = express.Router();

rockstarRouter.get('/rockstar-form', (req, res, next) => {
    const args = {
        backendUrl: BACKEND_CONF.BASE_URL
    }
    if (!req.isAuthenticated()) {
        res.render('rockstar/rockstar-form-login');
    } else {
        args.voterEmail = req.user.email;
        rockstarFormService.getCurrentRockstarPeriod().then(periodResp => {
            if (!periodResp.error) {
                args.rockstarPeriod = periodResp.rockstarPeriod;
                args.csrfToken = req.csrfToken();
                return res.render('rockstar/rockstar-form', args);
            } else return res.render('rockstar/rockstar-no-period');
        });
    }
});

rockstarRouter.post('/rockstar-form',
    body('nominatedEmail').isEmail().withMessage("Debes escoger a un estudiante del listado/dropdown para nominarlo, el correo del nominado no es valido"),
    body("voterEmail").isEmail().withMessage("Tu correo no es valido para poder votar"),
    body("reasonToNominate").isString().notEmpty().withMessage("La razon por la cual estas nominando a esta persona es requerida."),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash("errors", errors.errors);
            return res.redirect('/rockstar-form')
        } else {
            rockstarFormService.saveRockstarFormData(req.body).then(saveResp => {
                if (!saveResp.error) res.render("rockstar/rockstar-form-success");
                else {
                    req.flash("error", saveResp.error.message);
                    res.redirect('/rockstar-form');
                }
            });
        }
    });

module.exports = {
    rockstarRouter: rockstarRouter
};