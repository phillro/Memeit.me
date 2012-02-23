exports.index = function (req, res) {
    res.send('stream index');
};

exports.new = function (req, res) {
    res.send('new stream');
};

exports.create = function (req, res) {
    var streamObj = req.body
    if (typeof streamObj == 'string') {
        streamObj = JSON.parse(streamObj)
    }
    var streamModel = new models.streams(streamObj)
    streamModel.save(function (err, result) {
        if (err) {
            res.send({success:false})
            console.log(err)
        }
        if (result) {
            res.send({success:true,result:result})
        }

    })
};

exports.show = function (req, res) {
    res.send('show stream ' + req.params.stream);
};

exports.edit = function (req, res) {
    res.send('edit stream ' + req.params.stream);
};

exports.update = function (req, res) {
    res.send('update stream ' + req.params.stream);
};

exports.destroy = function (req, res) {
    res.send('destroy stream ' + req.params.stream);
};


exports.load = function (req, id, fn) {
    fn(null, {id:1, name:'my Stream'})
}