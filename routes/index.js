/*
 * GET home page.
 */

exports.index = function (req, res) {
    models.streams.find({}, function (err, results) {
        if (req.query.ajax) {
            if (!results)
                results = []
            res.partial('streamListPartial.ejs', {title:'Trollme.me', streams:results})
        } else {
            if (!results)
                results = []
            res.render('index', {title:'Trollme.me', streams:results})
        }
    })

};


