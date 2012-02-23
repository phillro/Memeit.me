var mongoose = require('mongoose')
var Schema = mongoose.Schema
var Types = mongoose.Types
    , ObjectId = Schema.ObjectId
var mongooseTypes = require("mongoose-types")
    , useTimestamps = mongooseTypes.useTimestamps;


module.exports = function() {

    var Streams = new Schema({
        name: String,
        terms : [String],
        tweets : [Object]
    });
    Streams.plugin(useTimestamps);
    return Streams

}()