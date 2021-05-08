const {User} = require('../model/user');

exports.user = async (req, res) => {
    const userId = req.session.passport.user.id;
    const user = await User.findByPk(userId);
    res.render('setting/user', {
        user: user,
        ...req.session.flash
    });
}