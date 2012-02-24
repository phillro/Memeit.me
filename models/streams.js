var mongoose = require('mongoose')
var Schema = mongoose.Schema
var Types = mongoose.Types
    , ObjectId = Schema.ObjectId
var mongooseTypes = require("mongoose-types")
    , useTimestamps = mongooseTypes.useTimestamps;


module.exports = function () {

    var Streams = new Schema({
        name:String,
        terms:[String],
        tweets:[Object]
    });
    Streams.plugin(useTimestamps);


    Streams.statics.getDistinctTerms = function (callback) {
        var command = {
            distinct:'streams',
            key:'terms'
        }
        this.db.db.executeDbCommand(command, function (err, results) {
            var values = undefined
            if (results) {
                if (results.documents) {
                    values = results.documents[0].values
                }
            }
            callback(err, values)
        });
    }

    Streams.statics.matchStreamsToTerms = function (terms, callback) {
        this.find({terms:{$in:terms}}, function (err, results) {
            callback(err, results)
        })
    }


    /*
     All terms should be lower case
     */
    Streams.pre('save', function (next) {
        for (var i = 0; i < this.terms.length; i++) {
            this.terms[i] = this.terms[i].toLowerCase()
        }
        next()
    })

    return Streams
}()