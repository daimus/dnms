const {User} = require('../../model/user');
const hash = require('../../util/hash');

exports.update = async (req, res) => {
    const userId = req.session.passport.user.id;
    let password = {};
    if (req.body.password !== ''){
        if (req.body.password !== req.body.password_confirmation){
            req.flash('alert', {
                status: 'danger',
                title: 'Ouch!',
                message: 'Password confirmation not match!'
            });
            return res.redirect('/setting/user');
        }
        password.password = await hash.passwordHash(req.body.password);
    }
    await User.update({
        name: req.body.name,
        username: req.body.username,
        ...password,
    }, {
        where: {
            id: userId
        }
    }).then(result => {
        req.flash('alert', {
            status: 'success',
            title: 'Success!',
            message: 'Update user success!'
        });
    }).catch(err => {
        logger.error(`error query ${JSON.stringify(error)}`);
    });
    res.redirect('/setting/user');
}