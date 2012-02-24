var twitter = require('ntwitter');
module.exports = twitterWrapper = function (terms, options) {
    this.terms = terms
    this.twitter = new twitter({
        consumer_key:options.conf.twitter.consumer_key,
        consumer_secret:options.conf.twitter.consumer_secret,
        access_token_key:options.conf.twitter.access_token,
        access_token_secret:options.conf.twitter.access_token_secret
    })


    return this;
}