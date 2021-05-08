const passport = require("passport");
const {User} = require("../model/user");

exports.login = (req, res) => {
    res.render('auth/login');
}

exports.signin = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err){
            logger.error(`user authenticate failed ${JSON.stringify(err)}`);
            return next(err);
        }
        if (!user){
            return res.render('auth/login', {alert: {
                status: 'danger',
                title: 'Ouch!',
                message: info.message
            }});
        }
        req.logIn(user, (err) => {
            if (err){
                logger.error(`login failed ${JSON.stringify(err)}`);
                return next(err);
            }
            res.redirect('/');
        });
    })(req, res, next);
}

exports.register = (req, res) => {
    res.render('auth/register');
}

exports.signup = (req, res, next) => {
    const user = new User(req.body);

    User.findOne({username: req.body.username}, (err, existingUser) => {
        if (err) {
            return next(err);
        }
        if (existingUser){
            req.flash('alert', {message: `${user.email} already registered. Please login with correct credentials`, status: 'danger', title: 'Ouch!'})
            return res.redirect('/login');
        }
        user.save((err) => {
            if (err){
                logger.error(`failed to save user ${JSON.stringify(err)}`);
                return next(err);
            }
            req.logIn(user, (err) => {
                if (err){
                    logger.error(`login failed ${JSON.stringify(err)}`);
                    return next(err);
                }
                res.redirect('/');
            });
        });
    });
}

exports.logout = (req, res) => {
    req.logout();
    req.session.destroy((err) => {
        if (err){
            logger.error(`failed to destroy session ${JSON.stringify(err)}`);
        }
        req.user = null;
        res.redirect('/login');
    });
}