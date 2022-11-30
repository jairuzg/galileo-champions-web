const express = require('express');
const passport = require('passport');
const path = require("path");
const expressSession = require('express-session');
const MemoryStore = require('memorystore')(expressSession)
const csrf = require('csurf');
const cookieParser = require("cookie-parser");
const flash = require('connect-flash');
const app = express();
const {notFoundHandler, errorHandler} = require("./controllers/helpers.controller");

app.set("views", path.join(__dirname, "/views"));
app.locals.basedir = path.join(__dirname, 'views');
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser("random"));
app.use(expressSession({
    secret: 'random',
    resave: true,
    saveUninitialized: true,
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    })
}))
app.use(csrf());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.error = req.flash('error') || req.session.error;
    res.locals.errors = req.flash('errors');
    res.locals.message = req.flash("message");
    next();
});

const {authRouter} = require("./controllers/auth.controller");
const {storefrontRouter} = require("./controllers/storefront.controller");
const {rockstarRouter} = require("./controllers/rockstar.controller");
const {lecturerRouter} = require("./controllers/lecturer.controller");

app.use(authRouter);
app.use(storefrontRouter);
app.use(rockstarRouter);
app.use(lecturerRouter);
app.use(function (req, res, next) {
    notFoundHandler(req, res, next);
});
app.use(errorHandler());

const applicationPort = 3000;
app.listen(applicationPort, () => {
    console.info("Running Galileo-Champions backend in port  ", applicationPort);
})