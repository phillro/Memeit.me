exports.index = function (req, res) {
    res.send('stream index');
};

exports.new = function (req, res) {
    res.send('new stream');
};

//Create a new stream from a post. Body includes JSON for the stream object
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


//Auto load the resources object
exports.load = function (req, id, fn) {
    //tbd make this load a models/streams.js
    fn(null, {id:1, name:'my Stream'})
}