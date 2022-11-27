const express = require('express');
const passport = require("passport");
const {EMAIL_PROVIDER, STUDENT_ROLE} = require("../config/constants");
const {body, validationResult, param} = require("express-validator");
const authService = require("../services/auth/auth.service");
const authRouter = express.Router();
require('./../services/passports/passport_google')(passport);
require('./../services/passports/passport_local')(passport);
const {translate} = require('./../common/utils');
const {TRANSLATION_LANG} = require("../config/app_config");
const appUtils = require("../common/utils");

authRouter.get('/login', (req, res) => {
    if (req.session.messages) {
        req.flash('errors', req.session.messages);
    }
    res.render('auth/login', {csrfToken: req.csrfToken()});
});

authRouter.post('/login',
    body('email').isEmail().withMessage("El email es requerido"),
    body('password').trim().isString().notEmpty().withMessage("El password es requerido"),
    param('redirectUrl').isString().optional(),
    param('failureRedirectUrl').isString().optional(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash("errors", errors.errors);
            res.redirect('login');
        } else {
            passport.authenticate('local', {
                failureRedirect: '/login',
                successRedirect: '/',
                failureFlash: true
            })(req, res, next);
        }
    });

authRouter.get('/register', (req, res) => {
    res.render('auth/register', {
        csrfToken: req.csrfToken(),
        provider: EMAIL_PROVIDER,
        role: STUDENT_ROLE
    });
});

authRouter.get('/register-success', (req, res, next) => {
    res.render('auth/register-success');
});

authRouter.get('/account-confirm-success', (req, res, next) => {
    res.render('auth/account-confirm-success');
});

authRouter.get('/account-confirm-error', (req, res, next) => {
    res.render('auth/account-confirm-error');
});

authRouter.get('/confirm-account/:token',
    param('token').isString().notEmpty().withMessage("Error al tratar de leer el token de validacion."),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('errors', errors.errors);
            res.redirect('/account-confirm-error');
        } else {
            authService.confirmAccount(req.params.token).then(confirmResp => {
                if (confirmResp.isAccountValidated) res.redirect('/account-confirm-success');
                else {
                    translate(confirmResp.err.message, TRANSLATION_LANG).then(text => {
                        req.flash('errors', [text]);
                    }).catch(te => {
                        console.log(te.message);
                        req.flash('errors', [confirmResp.err.message]);
                    }).finally(() => {
                        res.redirect('/account-confirm-error')
                    });
                }
            })
        }
    });

authRouter.post('/register',
    body('email').isEmail().withMessage("Debes proveer un email valido"),
    body('password').isString().notEmpty().withMessage('Debes proveer una contraseña'),
    body('confirmPassword').isString().notEmpty().withMessage('Debes proveer una contraseña y confirmarla'),
    body('firstname').isString().notEmpty().withMessage('El campo nombres es obligatorio'),
    body('lastname').isString().notEmpty().withMessage('El campo apellidos es obligatorio'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('errors', errors.errors);
            res.redirect('/register');
        } else {
            authService.registerStudent(req.body).then(registerResp => {
                if (!registerResp.error) {
                    res.redirect('/register-success');
                } else {
                    translate(registerResp.error.message, TRANSLATION_LANG).then(text => {
                        req.flash('errors', [text]);
                    }).catch(ex => {
                        console.log("Ocurrio un error al tratar de traducir el texto de error. ", ex.message);
                        req.flash('errors', [registerResp.error.message]);
                    }).finally(() => {
                        res.redirect('/register');
                    });
                }
            });
        }
    });

authRouter.get('/login/google', (req, res, next) => {
    const authenticationOptions = {
        scope: ['profile', 'email'],
        hostedDomain: 'galileo.edu',
        state: 'el state es un diablillo'
    };

    if (req.query.redirectUrl && req.query.failureRedirectUrl) {
        req.session.redirectUrl = req.query.redirectUrl;
        req.session.failureRedirectUrl = req.query.failureRedirectUrl;
        const proposedState = {
            redirectUrl: req.query.redirectUrl,
            failureRedirectUrl: req.query.redirectUrl
        };
        authenticationOptions.state = appUtils.object2KeyValueString(proposedState);
    }

    passport.authenticate('google', {
        scope: ['profile', 'email'],
        hostedDomain: 'galileo.edu',
        state: 'redirectUrl:/rockstar-form,failureRedirectUrl:/rockstar-form'
    })(req, res, next);
});

authRouter.get('/login/google/callback', function (req, res, next) {
        passport.authenticate('google', {
            failureRedirectUrl: req.session.failureRedirectUrl ? req.session.failureRedirectUrl : '/login',
            hostedDomain: 'galileo.edu',
            failureMessage: true,
            failureMessages: true,
            failureFlash: true,
            passReqToCallback: true
        }, function (err, user, info) {
            const failureRedirectUrl = req.session.failureRedirectUrl ? req.session.failureRedirectUrl : '/login';
            const successRedirectUrl = req.session.redirectUrl ? req.session.redirectUrl : '/';
            delete req.session.redirectUrl;
            delete req.session.failureRedirectUrl;

            if (err) {
                return next(err);
            }
            if (info && !user) {
                req.flash("error", info.message);
                return res.redirect(failureRedirectUrl);
            }

            req.login(user, function (err2) {
                if (err2) {
                    return res.redirect(failureRedirectUrl);
                } else return res.redirect(successRedirectUrl);
            });

        })(req, res, next);
    }
);

authRouter.get('/logout', (req, res) => {
    req.session.destroy()
    req.logout(function (err) {
        res.redirect('/login');
    });
});

authRouter.post('/reset-password-link',
    body('email').isEmail().withMessage("Email para resetear password es requerido"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash("errors", errors.errors);
            res.redirect("/login");
        } else {
            authService.submitResetPasswordRequest(req.body.email).then(resetResp => {
                if (!resetResp.error) res.redirect('/reset-password-link-success');
                else {
                    req.flash("error", resetResp.error.message);
                    res.redirect('/reset-password-link-error');
                }
            });
        }
    });

authRouter.get('/reset-password-link-success', (req, res) => {
    res.render('auth/reset-password-link-success');
});

authRouter.get('/reset-password-link-error', (req, res) => {
    res.render('auth/reset-password-link-error');
});

authRouter.get('/reset-password/:token',
    param('token').isString().notEmpty().withMessage("Error al tratar de leer el token de reinicio de contraseña."),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash("errors", errors.errors);
            res.redirect('/reset-password-error');
        } else {
            authService.askTokenValidity(req.params.token).then(validationResp => {
                if (validationResp.isTokenValid) return res.render('auth/reset-password', {
                    csrfToken: req.csrfToken(),
                    token: req.params.token
                });
                else {
                    req.flash("error", validationResp.error.message);
                    res.redirect('/reset-password-error');
                }
            });
        }
    });

authRouter.post('/reset-password',
    body('token').isString().notEmpty().withMessage("Error al tratar de leer el token de reinicio de contraseña."),
    body('password').isString().notEmpty().withMessage("El password es obligatorio y no se pudo recibir"),
    body('confirmPassword').isString().notEmpty().withMessage("Debes confirmar tu password"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (req.body.password && req.body.confirmPassword && req.body.password !== req.body.confirmPassword)
            errors.errors.push({msg: "Las contraseñas no coinciden"});
        if (!errors.isEmpty()) {
            req.flash("errors", errors.errors);
            return res.render('auth/reset-password-error', {errors: errors.errors});
        } else {
            authService.resetPasswordByToken(req.body.password, req.body.token).then(resetResp => {
                if (resetResp.isPasswordReset) return res.redirect('/reset-password-success');
                else {
                    req.flash("error", resetResp.error.message);
                    res.redirect('/reset-password-error');
                }
            });
        }
    });

authRouter.get('/reset-password-success', (req, res) => {
    res.render('auth/reset-password-link-success');
});

authRouter.get('/reset-password-error', (req, res) => {
    res.render('auth/reset-password-link-error');
});

module.exports = {
    authRouter: authRouter
}