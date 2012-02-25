
/*
 * GET home page.
 */

exports.index = function(req, res){
    models.streams.find({},function(err,results){
        if(!results)
            results=[]
        res.render('index',{title:'Trollme.me',streams:results})
    })

};


