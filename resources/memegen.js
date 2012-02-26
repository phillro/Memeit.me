var Memefier = require('../lib/memefier')
var memefier = new Memefier()
exports.index = function (req, res) {

    var imageSrc = req.query.imageSrc || ''
    var imageTxt1 = req.query.txt1 || ''
    var imageTxt2 = req.query.txt1 || undefined
    var uid = req.query.uid || (new Date()).getTime().toString()
    var options = {}
    try {
        if (req.query.width)
            options.width = parseInt(req.query.width)
        if (req.query.height)
            options.height = parseInt(req.query.height)
    }catch(ex){}
    memefier.makeMeme(imageSrc, imageTxt1, imageTxt2, uid, options, function (err, imageSrc) {
        var response = {success:false}
        if (err) {
            if (imageSrc) {
                if (imageSrc.errorMessage) {
                    response.errorMessage = imageSrc.errorMessage
                }
            }
            res.send(response)
        } else {
            res.send(configSettings.baseUrl + ':' + configSettings.port + configSettings.memeUrlPath + '/' + imageSrc)
        }
    })
};

