/* global require */
const passport = require('passport');
const {
    Strategy: LocalStrategy
} = require('passport-local');
const bcrypt = require('bcrypt');

const {
    User
} = require('../model/user');

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    User.findOne({
        where: {
            id: user.id
        }
    }).then((user) => {
        done(null, user);
    }).catch((error) => {
        done(error, null);
    });
});

// Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, (username, password, done) => {
    User.findOne({
        where: {
            username: username.toLocaleLowerCase()
        }
    }).then((user) => {
        if (user === null) {
            return done(null, false, {
                message: 'User not found'
            });
        }
        bcrypt.compare(password, user.password, (error, isMatch) => {
            if (error) {
                return done(error);
            }
            if (isMatch) {
                return done(null, user);
            }
            return done(null, false, {
                message: 'Invalid Password'
            });
        });
    }).catch((error) => {
        return done(error);
    });
}));