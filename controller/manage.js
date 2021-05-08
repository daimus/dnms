exports.server = async (req, res) => {
    res.render('manage/server');
}

exports.device = (req, res) => {
    res.render('manage/device');
}

exports.subnetwork = (req, res) => {
    res.render('manage/subnetwork');
}