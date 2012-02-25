exports.index = function (req, res) {


    models.streams.getDistinctTerms(function (err, results) {
        if (err) {
            res.send(err)
        } else {
            res.send(results);
        }
    })
};

exports.new = function (req, res) {
    reinitStreams(function(err,result){
        if(err)
            res.send({success:false, result:err})
        else{
            res.send({success:true, result:'intialized streams'})
        }
    })
};

//Create a new stream from a post. Body includes JSON for the stream object
exports.create = function (req, res) {
    var streamObj = req.body
    if (typeof streamObj == 'string') {
        streamObj = JSON.parse(streamObj)
    }
    var streamModel = new models.streams(streamObj)
    //get the distinct terms so we can check if there are any new terms to add to a stream
    models.streams.getDistinctTerms(function (err, distinctTerms) {
        streamModel.save(function (err, result) {
            if (err) {
                res.send({success:false})
                console.log(err)
            }
            if (result) {
                //Check for existing terms, add new ones
                var termsAdded = false
                if (distinctTerms) {
                    for (var i = 0; i < streamModel.terms.length; i++) {
                        if (distinctTerms.indexOf(streamModel.terms[i]) == -1) {
                            termsAdded = true
                        }
                    }
                    if (termsAdded)
                        streamReInitPending = true
                    res.send({success:true, result:{msg:'Stream created.', id:result}})
                }


            }
        })

    })
};

exports.show = function (req, res) {
    app.socketHandler.emit('eventMsg', getMoreCompleteEventData)

};

exports.edit = function (req, res) {
    res.send(req.stream);
};

exports.update = function (req, res) {
    res.send(req.stream);
};

exports.destroy = function (req, res) {
    res.send(req.stream);
};


//Auto load the resource object by id.
exports.load = function (req, id, fn) {
    models.streams.findById(id, function (err, stream) {
        if (err)
            fn(err)
        else
            fn(err, stream)
    })

}