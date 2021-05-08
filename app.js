const express = require('express');
const expressSession = require('express-session');
const flash = require('connect-flash');
const dotenv = require('dotenv').config();
const methodOverride = require('method-override');
const jsend = require('jsend');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const passportConfig = require('./config/passport');
const {logger} = require('./config/logger');
const sharedSession = require('express-socket.io-session');
const MySQLStore = require('connect-mysql')(expressSession);

const app = express();

const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer);

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(jsend.middleware);
app.use(methodOverride('_method'));
app.use(cookieParser(process.env.SESSION_SECRET));
const session = expressSession({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: {
        maxAge: 2678400000
    },
    store: new MySQLStore({
        config: {
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME
        }
    })
});
app.use(session);
app.use(flash());
app.use((req, res, next) => {
    res.locals.alert = req.flash('alert');
    next();
});
app.use(passport.initialize());
app.use(passport.session());

const routes = require('./routes');
routes(app);

io.use(sharedSession(session));
io.on("connection", (socket) => {
    const socketAction = require('./config/socket-action');
    socketAction.init(socket);
    logger.silly(`incoming socket connection: ${socket.id}`);
    socket.on('disconnect', () => {
        logger.silly(`socket connection terminated: ${socket.id}`);
    });
});

httpServer.listen(process.env.APP_PORT, () => {
    logger.info(`server is running`);
});