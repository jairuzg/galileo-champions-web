const {HTTP_STATUS} = require("../config/constants");
const isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else return res.redirect('/login');
}

const notFoundHandler = (req, res, next) => {
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('auth/page-404', {url: req.url});
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.json({error: 'Not found'});
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
};

function errorHandler() {
    return function (err, req, res, next) {
        if (!(err instanceof Error)) return next(err);
        res.status(err.code ? err.code : HTTP_STATUS.INTERNAL_SERVER_ERROR).render("auth/page-500", {message: err});
    };
};

module.exports = {
    isAuth: isAuth,
    notFoundHandler: notFoundHandler,
    errorHandler: errorHandler
}