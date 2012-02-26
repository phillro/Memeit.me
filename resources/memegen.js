var Memefier = require('../lib/memefier')
var memefier = new Memefier()
exports.index = function (req, res) {

    var imageSrc = decodeURIComponent(req.query.imageSrc || '')
    var topText = decodeURIComponent(req.query.topText || '')
    var bottomText = decodeURI(req.query.bottomText || '')
    var uid = req.query.uid || (new Date()).getTime().toString()
    var options = {}
    try {
        if (req.query.width)
            options.width = parseInt(req.query.width)
        if (req.query.height)
            options.height = parseInt(req.query.height)
    }catch(ex){}
    memefier.makeMeme(imageSrc, topText, bottomText, uid, options, function (err, imageSrc) {
        var response = {success:false}
        if (err) {
            if (imageSrc) {
                if (imageSrc.errorMessage) {
                    response.errorMessage = imageSrc.errorMessage
                }
            }
            res.send(response)
        } else {
            res.send(imageSrc)
        }
    })
};

